import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { releaseOrderReservation } from '@/lib/shop';
import { getPaymentGateway } from '@/lib/payment-gateways';
import type { PaymentProviderId } from '@/lib/payment-providers/types';

function redirectResult(res: NextApiResponse, result: string, order?: string) {
  const params = new URLSearchParams({ result });
  if (order) params.set('order', order);
  res.redirect(302, `/shop/payment?${params.toString()}`);
}

function isPaymentProvider(value: string): value is PaymentProviderId {
  return value === 'ZARINPAL' || value === 'ZIBAL';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const referenceValue =
    req.query.trackId ?? req.query.Authority ?? req.query.authority;
  const reference =
    typeof referenceValue === 'string' &&
    /^[a-zA-Z0-9]{1,64}$/.test(referenceValue)
      ? referenceValue
      : null;
  if (!reference) {
    return res.status(400).json({ message: 'شناسه پرداخت معتبر نیست' });
  }

  try {
    const db = await getPrisma();
    const order = await db.shopOrder.findUnique({
      where: { providerReference: reference },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        provider: true,
        expiresAt: true,
        items: { select: { variantId: true, quantity: true } },
      },
    });
    if (!order) return res.status(404).json({ message: 'سفارش یافت نشد' });
    if (
      ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
    ) {
      return redirectResult(res, 'success', order.orderNumber);
    }
    if (order.status === 'REFUND_REQUIRED') {
      return redirectResult(res, 'refund-required', order.orderNumber);
    }
    if (!isPaymentProvider(order.provider)) {
      return redirectResult(res, 'verification-error', order.orderNumber);
    }

    const amountInRial = order.totalAmount * 10;
    if (
      !Number.isSafeInteger(order.totalAmount) ||
      order.totalAmount <= 0 ||
      !Number.isSafeInteger(amountInRial) ||
      amountInRial > 2_147_483_647
    ) {
      return redirectResult(res, 'verification-error', order.orderNumber);
    }
    const gateway = await getPaymentGateway(db, order.provider, {
      allowDisabled: true,
    });
    if (!gateway) {
      return redirectResult(res, 'verification-error', order.orderNumber);
    }

    let verification: Awaited<ReturnType<typeof gateway.verifyPayment>>;
    try {
      verification = await gateway.verifyPayment(reference, amountInRial);
    } catch {
      console.error('Shop payment verification failed');
      return redirectResult(res, 'verification-error', order.orderNumber);
    }
    if (verification.state === 'not-paid') {
      const callbackReportsSuccess =
        req.query.success === '1' || req.query.Status === 'OK';
      await db.$transaction(async (tx) => {
        const current = await tx.shopOrder.findUnique({
          where: { id: order.id },
          select: {
            status: true,
            items: { select: { variantId: true, quantity: true } },
          },
        });
        if (current?.status !== 'PENDING_PAYMENT') return;
        await releaseOrderReservation(tx, { id: order.id, items: current.items });
        await tx.shopOrder.update({
          where: { id: order.id },
          data: {
            status: callbackReportsSuccess ? 'PAYMENT_FAILED' : 'CANCELLED',
          },
        });
      });
      return redirectResult(
        res,
        callbackReportsSuccess ? 'failed' : 'cancelled',
        order.orderNumber,
      );
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
          if (current.expiresAt <= new Date()) {
            await tx.shopOrder.update({
              where: { id: order.id },
              data: { status: 'REFUND_REQUIRED' },
            });
            return 'refund-required';
          }
          return 'cancelled';
        }
        if (current.status === 'PAYMENT_FAILED') return 'failed';
        if (current.status === 'REFUND_REQUIRED') return 'refund-required';
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
  } catch {
    console.error('Shop payment callback failed');
    return redirectResult(res, 'verification-error');
  }
}
