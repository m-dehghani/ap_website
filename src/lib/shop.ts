import { z } from 'zod';
import type { PrismaClient } from '../../prisma/generated/client';

type ShopOrderReservation = {
  id: string;
  items: Array<{ variantId: string | null; quantity: number }>;
};
type ReservationTx = {
  shopVariant: {
    updateMany: (args: {
      where: { id: string; reserved: { gte: number } };
      data: { reserved: { decrement: number } };
    }) => Promise<{ count: number }>;
  };
};

export async function releaseOrderReservation(
  tx: ReservationTx,
  order: ShopOrderReservation,
) {
  for (const item of order.items) {
    if (!item.variantId) continue;

    const released = await tx.shopVariant.updateMany({
      where: { id: item.variantId, reserved: { gte: item.quantity } },
      data: { reserved: { decrement: item.quantity } },
    });
    if (!released.count) {
      throw new Error(`Reservation count mismatch for order ${order.id}`);
    }
  }
}

export async function releaseExpiredShopOrders(
  db: PrismaClient,
  now = new Date(),
) {
  const expiredOrder = await db.shopOrder.findFirst({
    where: { status: 'PENDING_PAYMENT', expiresAt: { lte: now } },
    select: { id: true },
  });
  if (!expiredOrder) return;

  await db.$transaction(async (tx) => {
    const expiredOrders = await tx.shopOrder.findMany({
      where: { status: 'PENDING_PAYMENT', expiresAt: { lte: now } },
      select: {
        id: true,
        items: { select: { variantId: true, quantity: true } },
      },
    });
    for (const order of expiredOrders) {
      const canceled = await tx.shopOrder.updateMany({
        where: {
          id: order.id,
          status: 'PENDING_PAYMENT',
          expiresAt: { lte: now },
        },
        data: { status: 'CANCELLED' },
      });
      if (!canceled.count) continue;

      await releaseOrderReservation(tx, order);
    }
  });
}

const httpUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .url()
  .refine((value) => value.startsWith('https://'));

export const shopVariantInputSchema = z.object({
  sku: z.string().trim().min(1).max(80),
  size: z.string().trim().max(40).nullable().optional(),
  color: z.string().trim().max(60).nullable().optional(),
  priceOverride: z.number().int().positive().nullable().optional(),
  stock: z.number().int().nonnegative(),
  isActive: z.boolean().optional(),
});

export const shopProductInputSchema = z.object({
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(180),
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(10_000),
  shortDescription: z.string().trim().max(500).nullable().optional(),
  images: z.array(httpUrlSchema).max(12),
  price: z.number().int().positive(),
  salePrice: z.number().int().positive().nullable().optional(),
  saleStartsAt: z.coerce.date().nullable().optional(),
  saleEndsAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean(),
  isComingSoon: z.boolean(),
  availableAt: z.coerce.date().nullable().optional(),
  featured: z.boolean(),
  variants: z.array(shopVariantInputSchema).min(1).max(100),
}).superRefine((product, ctx) => {
  const skus = product.variants.map(({ sku }) => sku);
  if (new Set(skus).size !== skus.length) {
    ctx.addIssue({
      code: 'custom',
      path: ['variants'],
      message: 'شناسه SKU هر گزینه باید یکتا باشد',
    });
  }
  if (
    product.salePrice !== undefined &&
    product.salePrice !== null &&
    product.salePrice >= product.price
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['salePrice'],
      message: 'قیمت تخفیف باید از قیمت اصلی کمتر باشد',
    });
  }
  if (
    product.saleStartsAt &&
    product.saleEndsAt &&
    product.saleStartsAt >= product.saleEndsAt
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['saleEndsAt'],
      message: 'زمان پایان تخفیف باید بعد از شروع آن باشد',
    });
  }
});

export const shopReviewInputSchema = z.object({
  productId: z.string().min(1),
  orderNumber: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(3).max(3000),
  mediaUrls: z.array(httpUrlSchema).max(5).default([]),
});

export function isSaleActive(
  product: {
    salePrice: number | null;
    saleStartsAt: Date | null;
    saleEndsAt: Date | null;
  },
  now = new Date(),
): boolean {
  return (
    product.salePrice !== null &&
    (product.saleStartsAt === null || product.saleStartsAt <= now) &&
    (product.saleEndsAt === null || product.saleEndsAt >= now)
  );
}

export function getVariantPrice(
  product: {
    price: number;
    salePrice: number | null;
    saleStartsAt: Date | null;
    saleEndsAt: Date | null;
  },
  variant: { priceOverride: number | null },
  now = new Date(),
): number {
  const regularPrice = variant.priceOverride ?? product.price;
  return isSaleActive(product, now) && product.salePrice! < regularPrice
    ? product.salePrice!
    : regularPrice;
}

export function getAvailableStock(variant: {
  stock: number;
  reserved: number;
}): number {
  return Math.max(variant.stock - variant.reserved, 0);
}

export function isValidTomanAmount(amount: number): boolean {
  return (
    Number.isSafeInteger(amount) &&
    amount > 0 &&
    Number.isSafeInteger(amount * 10) &&
    amount * 10 <= 2_147_483_647
  );
}
