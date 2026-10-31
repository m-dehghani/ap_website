import type { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { getPrisma } from '@/lib/db';
import { getOptionalSession, normalizePhone } from '@/lib/auth';
import { getAvailableStock, getVariantPrice, isValidTomanAmount } from '@/lib/shop';
import { getZarinpalConfig, requestPayment } from '@/lib/zarinpal';

const checkoutSchema = z.object({
  fullName: z.string().trim().min(3).max(120),
  phone: z.string().trim().min(7).max(30),
  email: z.union([z.string().trim().email().max(254), z.literal('')]).optional(),
  address: z.string().trim().min(10).max(1000),
  province: z.string().trim().max(100).optional(),
  city: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().regex(/^[0-9۰-۹٠-٩]{10}$/, 'کد پستی باید ۱۰ رقم باشد'),
  expectedSubtotal: z.number().int().nonnegative(),
  expectedShippingFee: z.number().int().nonnegative().nullable(),
  items: z.array(
    z.object({
      variantId: z.string().min(1),
      quantity: z.number().int().min(1).max(20),
    }),
  ).min(1).max(30),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const config = getZarinpalConfig();
  if (!config) {
    return res.status(503).json({
      message: 'درگاه پرداخت پیکربندی نشده است؛ لطفاً با آکادمی تماس بگیرید',
    });
  }

  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'اطلاعات سفارش معتبر نیست',
      errors: parsed.error.issues.map(({ path, message }) => ({
        field: path.join('.'),
        message,
      })),
    });
  }
  const input = parsed.data;
  const phone = normalizePhone(input.phone);
  const postalCode = normalizePhone(input.postalCode);
  if (!/^\+?\d{7,15}$/.test(phone)) {
    return res.status(400).json({ message: 'شماره تلفن معتبر وارد کنید' });
  }
  if (!/^\d{10}$/.test(postalCode)) {
    return res.status(400).json({ message: 'کد پستی باید ۱۰ رقم باشد' });
  }
  if (new Set(input.items.map(({ variantId }) => variantId)).size !== input.items.length) {
    return res.status(400).json({ message: 'محصول تکراری در سبد خرید وجود دارد' });
  }

  const db = await getPrisma();
  const session = await getOptionalSession(req);
  const userId =
    session?.source === 'user' && session.role === 'STUDENT'
      ? session.id
      : null;
  const now = new Date();
  let orderId: string | undefined;

  try {
    const order = await db.$transaction(
      async (tx) => {
        const expired = await tx.shopOrder.findMany({
          where: { status: 'PENDING_PAYMENT', expiresAt: { lte: now } },
          select: {
            id: true,
            items: { select: { variantId: true, quantity: true } },
          },
        });
        for (const staleOrder of expired) {
          for (const item of staleOrder.items) {
            if (item.variantId) {
              await tx.shopVariant.update({
                where: { id: item.variantId },
                data: { reserved: { decrement: item.quantity } },
              });
            }
          }
          await tx.shopOrder.update({
            where: { id: staleOrder.id },
            data: { status: 'CANCELLED' },
          });
        }

        const settings = await tx.shopSettings.findUnique({
          where: { id: 'default' },
          select: { shippingFee: true },
        });

        // Get shipping fee from province/city
        let shippingFee = settings?.shippingFee ?? 0;
        if (input.province && input.city) {
          const city = await tx.city.findFirst({
            where: {
              name: input.city,
              province: { name: input.province },
              isActive: true,
            },
            include: { province: true },
          });
          if (city?.shippingFee !== null && city?.shippingFee !== undefined) {
            shippingFee = city.shippingFee;
          } else if (city?.province?.shippingFee !== null && city?.province?.shippingFee !== undefined) {
            shippingFee = city.province.shippingFee;
          }
        }

        const variants = await tx.shopVariant.findMany({
          where: {
            id: { in: input.items.map(({ variantId }) => variantId) },
            isActive: true,
            product: { isActive: true, isComingSoon: false },
          },
          include: { product: true },
        });
        if (variants.length !== input.items.length) {
          throw new Error('CART_ITEM_UNAVAILABLE');
        }
        const variantById = new Map(variants.map((variant) => [variant.id, variant]));
        const lines = input.items.map((item) => {
          const variant = variantById.get(item.variantId);
          if (!variant || getAvailableStock(variant) < item.quantity) {
            throw new Error('INSUFFICIENT_STOCK');
          }
          const unitPrice = getVariantPrice(variant.product, variant, now);
          return {
            variant,
            quantity: item.quantity,
            unitPrice,
            lineTotal: unitPrice * item.quantity,
          };
        });
        const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);
        const totalAmount = subtotal + shippingFee;
        if (!isValidTomanAmount(totalAmount)) {
          throw new Error('INVALID_PAYMENT_AMOUNT');
        }
        if (
          subtotal !== input.expectedSubtotal ||
          shippingFee !== input.expectedShippingFee
        ) {
          return {
            kind: 'price-changed' as const,
            subtotal,
            shippingFee,
            prices: lines.map((line) => ({
              variantId: line.variant.id,
              unitPrice: line.unitPrice,
            })),
          };
        }

        const orderNumber = `AP-${randomBytes(6).toString('hex').toUpperCase()}`;
        const created = await tx.shopOrder.create({
          data: {
            orderNumber,
            fullName: input.fullName,
            phone,
            email: input.email || null,
            address: input.address,
            province: input.province || null,
            city: input.city,
            postalCode,
            subtotal,
            shippingFee,
            totalAmount,
            userId,
            expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
            items: {
              create: lines.map(({ variant, quantity, unitPrice, lineTotal }) => ({
                productId: variant.productId,
                variantId: variant.id,
                productName: variant.product.name,
                sku: variant.sku,
                size: variant.size,
                color: variant.color,
                quantity,
                unitPrice,
                lineTotal,
              })),
            },
          },
          select: { id: true, orderNumber: true, totalAmount: true },
        });
        orderId = created.id;

        for (const line of lines) {
          await tx.shopVariant.update({
            where: { id: line.variant.id },
            data: { reserved: { increment: line.quantity } },
          });
        }
        return { kind: 'created' as const, ...created };
      },
      { isolationLevel: 'Serializable' },
    );

    if (order.kind === 'price-changed') {
      return res.status(409).json({
        code: 'PRICE_CHANGED',
        message: 'قیمت یا هزینه ارسال تغییر کرده است؛ مبلغ به‌روز شد، لطفاً دوباره بررسی کنید',
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        prices: order.prices,
      });
    }

    try {
      const payment = await requestPayment(
        config,
        order.totalAmount * 10,
        `خرید فروشگاه آکادمی - ${order.orderNumber}`,
        `${config.siteUrl}/api/shop/orders/callback`,
      );
      await db.shopOrder.update({
        where: { id: order.id },
        data: { authority: payment.authority },
      });
      return res.status(200).json({ paymentUrl: payment.paymentUrl });
    } catch (error) {
      await db.$transaction(async (tx) => {
        const pending = await tx.shopOrder.findUnique({
          where: { id: order.id },
          select: {
            status: true,
            items: { select: { variantId: true, quantity: true } },
          },
        });
        if (pending?.status === 'PENDING_PAYMENT') {
          for (const item of pending.items) {
            if (item.variantId) {
              await tx.shopVariant.update({
                where: { id: item.variantId },
                data: { reserved: { decrement: item.quantity } },
              });
            }
          }
          await tx.shopOrder.update({
            where: { id: order.id },
            data: { status: 'PAYMENT_FAILED' },
          });
        }
      });
      console.error('Shop payment request error:', error);
      return res.status(502).json({
        message: 'ایجاد درخواست پرداخت ناموفق بود؛ لطفاً دوباره تلاش کنید',
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'CART_ITEM_UNAVAILABLE') {
      return res.status(400).json({ message: 'یکی از محصولات دیگر قابل خرید نیست' });
    }
    if (error instanceof Error && error.message === 'INSUFFICIENT_STOCK') {
      return res.status(409).json({ message: 'موجودی یکی از محصولات کافی نیست' });
    }
    if (error instanceof Error && error.message === 'INVALID_PAYMENT_AMOUNT') {
      return res.status(400).json({ message: 'مبلغ سفارش معتبر نیست' });
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2034'
    ) {
      return res.status(409).json({
        message: 'موجودی سبد تغییر کرده است؛ لطفاً سبد خرید را تازه‌سازی کنید',
      });
    }
    if (orderId) {
      console.error(`Shop order ${orderId} creation failed:`, error);
    } else {
      console.error('Shop order creation error:', error);
    }
    return res.status(500).json({ message: 'خطا در ثبت سفارش' });
  }
}
