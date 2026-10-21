import { describe, expect, it, vi } from 'vitest';
import {
  getAvailableStock,
  getVariantPrice,
  isValidTomanAmount,
  releaseExpiredShopOrders,
  shopProductInputSchema,
  shopReviewInputSchema,
} from '@/lib/shop';

describe('expired shop order cleanup', () => {
  it('avoids opening a transaction when no reservation has expired', async () => {
    const transaction = vi.fn();
    const db = {
      shopOrder: { findFirst: vi.fn().mockResolvedValue(null) },
      $transaction: transaction,
    };

    await releaseExpiredShopOrders(db as never);

    expect(transaction).not.toHaveBeenCalled();
  });

  it('releases a reservation only after atomically cancelling its expired order', async () => {
    const tx = {
      shopOrder: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'order-1', items: [{ variantId: 'variant-1', quantity: 2 }] },
        ]),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      shopVariant: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const db = {
      shopOrder: { findFirst: vi.fn().mockResolvedValue({ id: 'order-1' }) },
      $transaction: vi.fn(
        (operation: (transaction: typeof tx) => Promise<unknown>) =>
          operation(tx),
      ),
    };

    await releaseExpiredShopOrders(db as never, new Date('2026-10-20T00:00:00Z'));

    expect(tx.shopOrder.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'order-1',
        status: 'PENDING_PAYMENT',
        expiresAt: { lte: new Date('2026-10-20T00:00:00Z') },
      },
      data: { status: 'CANCELLED' },
    });
    expect(tx.shopVariant.updateMany).toHaveBeenCalledWith({
      where: { id: 'variant-1', reserved: { gte: 2 } },
      data: { reserved: { decrement: 2 } },
    });
  });
});

describe('shop pricing and inventory helpers', () => {
  const product = {
    price: 100_000,
    salePrice: 75_000,
    saleStartsAt: new Date('2026-10-01T00:00:00.000Z'),
    saleEndsAt: new Date('2026-11-01T00:00:00.000Z'),
  };

  it('uses the active sale price but never raises a cheaper variant price', () => {
    const now = new Date('2026-10-20T00:00:00.000Z');
    expect(getVariantPrice(product, { priceOverride: null }, now)).toBe(75_000);
    expect(getVariantPrice(product, { priceOverride: 60_000 }, now)).toBe(60_000);
    expect(
      getVariantPrice(product, { priceOverride: null }, new Date('2026-11-02T00:00:00.000Z')),
    ).toBe(100_000);
  });

  it('subtracts pending reservations from available stock without returning negatives', () => {
    expect(getAvailableStock({ stock: 8, reserved: 3 })).toBe(5);
    expect(getAvailableStock({ stock: 2, reserved: 4 })).toBe(0);
  });

  it('accepts only safe positive toman prices within ZarinPal limits', () => {
    expect(isValidTomanAmount(1)).toBe(true);
    expect(isValidTomanAmount(214_748_364)).toBe(true);
    expect(isValidTomanAmount(214_748_365)).toBe(false);
    expect(isValidTomanAmount(1.5)).toBe(false);
    expect(isValidTomanAmount(0)).toBe(false);
  });
});

describe('shop input validation', () => {
  const validProduct = {
    slug: 'training-shoe',
    name: 'کفش تمرین',
    category: 'کفش',
    description: 'کفش فوتبال مناسب تمرین',
    images: ['https://example.com/shoe.jpg'],
    price: 1_000_000,
    salePrice: 800_000,
    isActive: true,
    isComingSoon: false,
    featured: false,
    variants: [
      { sku: 'SHOE-39', size: '39', color: 'مشکی', stock: 5 },
      { sku: 'SHOE-40', size: '40', color: 'مشکی', stock: 3 },
    ],
  };

  it('rejects duplicate SKUs and unsafe product media URLs', () => {
    expect(
      shopProductInputSchema.safeParse({
        ...validProduct,
        variants: [validProduct.variants[0], validProduct.variants[0]],
      }).success,
    ).toBe(false);
    expect(
      shopProductInputSchema.safeParse({
        ...validProduct,
        images: ['javascript:alert(1)'],
      }).success,
    ).toBe(false);
  });

  it('rejects invalid ratings and non-HTTP review media', () => {
    expect(
      shopReviewInputSchema.safeParse({
        productId: 'product-id',
        orderNumber: 'AP-123',
        rating: 6,
        body: 'نظر',
        mediaUrls: [],
      }).success,
    ).toBe(false);
    expect(
      shopReviewInputSchema.safeParse({
        productId: 'product-id',
        orderNumber: 'AP-123',
        rating: 5,
        body: 'کیفیت خوبی دارد',
        mediaUrls: ['data:text/html,unsafe'],
      }).success,
    ).toBe(false);
  });
});
