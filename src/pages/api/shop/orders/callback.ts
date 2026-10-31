import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { releaseOrderReservation } from '@/lib/shop';
import { getZarinpalConfig, verifyPayment } from '@/lib/zarinpal';

function redirectResult(res: NextApiResponse, result: string, order?: string) {
  const params = new URLSearchParams({ result });
  if (order) params.set('order', order);
  res.redirect(302, `/shop/payment?${params.toString()}`);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const authorityValue = req.query.Authority ?? req.query.authority;
  const statusValue = req.query.Status ?? req.query.status;
  const authority =
    typeof authorityValue === 'string' && /^[a-zA-Z0-9]{1,64}$/.test(authorityValue)
      ? authorityValue
      : null;
  if (!authority) return res.status(400).json({ message: 'شناسه پرداخت معتبر نیست' });

  try {
    const db = await getPrisma();
    const order = await db.shopOrder.findUnique({
      where: { authority },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        expiresAt: true,
        items: { select: { variantId: true, quantity: true } },
      },
    });
    if (!order) return res.status(404).json({ message: 'سفارش یافت نشد' });
    if (order.status === 'PAID' || order.status === 'PROCESSING' ||
      order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      return redirectResult(res, 'success', order.orderNumber);
    }

    if (statusValue !== 'OK') {
      await db.$transaction(async (tx) => {
        const pending = await tx.shopOrder.findUnique({
          where: { id: order.id },
          select: { status: true, items: { select: { variantId: true, quantity: true } } },
        });
        if (pending?.status !== 'PENDING_PAYMENT') return;
        await releaseOrderReservation(tx, {
          id: order.id,
          items: pending.items,
        });
        await tx.shopOrder.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' },
        });
      });
      return redirectResult(res, 'cancelled', order.orderNumber);
    }

    const config = getZarinpalConfig();
    if (!config) {
      console.error('Shop callback received without Zarinpal configuration');
      return redirectResult(res, 'verification-error', order.orderNumber);
    }
    const amountInRial = order.totalAmount * 10;
    if (!Number.isSafeInteger(amountInRial) || amountInRial > 2_147_483_647) {
      return redirectResult(res, 'verification-error', order.orderNumber);
    }

    let verification: Awaited<ReturnType<typeof verifyPayment>>;
    try {
      verification = await verifyPayment(config, authority, amountInRial);
    } catch (error) {
      console.error('Shop Zarinpal verification error:', error);
      return redirectResult(res, 'verification-error', order.orderNumber);
    }
    if (verification?.code === -21) {
      await db.$transaction(async (tx) => {
        const pending = await tx.shopOrder.findUnique({
          where: { id: order.id },
          select: { status: true, items: { select: { variantId: true, quantity: true } } },
        });
        if (pending?.status !== 'PENDING_PAYMENT') return;
        await releaseOrderReservation(tx, {
          id: order.id,
          items: pending.items,
        });
        await tx.shopOrder.update({
          where: { id: order.id },
          data: { status: 'PAYMENT_FAILED' },
        });
      });
      return redirectResult(res, 'failed', order.orderNumber);
    }
    if (verification?.code !== 100 && verification?.code !== 101) {
      return redirectResult(res, 'verification-error', order.orderNumber);
    }

    const result = await db.$transaction(
      async (tx) => {
        const current = await tx.shopOrder.findUnique({
          where: { id: order.id },
          select: { id: true, status: true, expiresAt: true, items: true },
        });
        if (!current) return 'verification-error';
        if (
          ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(current.status)
        ) {
          return 'success';
        }
        if (current.status === 'CANCELLED') {
          return 'cancelled';
        }
        if (current.status === 'PAYMENT_FAILED') {
          return 'failed';
        }
        if (current.status === 'REFUND_REQUIRED') {
          return 'refund-required';
        }
        if (current.status !== 'PENDING_PAYMENT') {
          return 'verification-error';
        }
        if (current.expiresAt <= new Date()) {
          await releaseOrderReservation(tx, current);
          await tx.shopOrder.update({
            where: { id: order.id },
            data: { status: 'REFUND_REQUIRED' },
          });
          return 'refund-required';
        }
        for (const item of current.items) {
          if (!item.variantId) throw new Error('Order item variant missing');
          await tx.shopVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { decrement: item.quantity },
              reserved: { decrement: item.quantity },
              soldCount: { increment: item.quantity },
            },
          });
        }
        await tx.shopOrder.update({
          where: { id: order.id },
          data: { status: 'PAID', paidAt: new Date() },
        });
        return 'success';
      },
      { isolationLevel: 'Serializable' },
    );
    return redirectResult(res, result, order.orderNumber);
  } catch (error) {
    console.error('Shop payment callback error:', error);
    return redirectResult(res, 'verification-error');
  }
}
