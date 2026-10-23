import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import {
  getAvailableStock,
  getVariantPrice,
  releaseExpiredShopOrders,
} from '@/lib/shop';

const DEFAULT_PAGE_SIZE = 12;
const PAGE_SIZES = [8, 12, 24, 48] as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const pageValue = Number(req.query.page ?? 1);
  const page =
    Number.isSafeInteger(pageValue) && pageValue > 0 && pageValue <= 10_000
      ? pageValue
      : 1;
  const requestedPageSize = Number(req.query.pageSize ?? DEFAULT_PAGE_SIZE);
  const pageSize =
    PAGE_SIZES.find((size) => size === requestedPageSize) ?? DEFAULT_PAGE_SIZE;
  const category =
    typeof req.query.category === 'string'
      ? req.query.category.slice(0, 80)
      : '';
  const search =
    typeof req.query.search === 'string'
      ? req.query.search.trim().slice(0, 100)
      : '';
  const featured = req.query.featured === 'true';
  const sort =
    typeof req.query.sort === 'string' ? req.query.sort : 'recent';
  const parsePriceBound = (value: string | string[] | undefined) => {
    if (value === undefined) return null;
    if (typeof value !== 'string' || !/^\d+$/.test(value)) return Number.NaN;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed <= 2_147_483_647
      ? parsed
      : Number.NaN;
  };
  const minPrice = parsePriceBound(req.query.minPrice);
  const maxPrice = parsePriceBound(req.query.maxPrice);
  if (
    Number.isNaN(minPrice) ||
    Number.isNaN(maxPrice) ||
    (minPrice !== null && maxPrice !== null && minPrice > maxPrice)
  ) {
    return res.status(400).json({ message: 'محدوده قیمت معتبر نیست' });
  }

  try {
    const db = await getPrisma();
    await releaseExpiredShopOrders(db);
    const where = {
      isActive: true,
      ...(category ? { category } : {}),
      ...(featured ? { featured: true } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { shortDescription: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [initialTotal, categories, priceProducts] = await Promise.all([
      db.shopProduct.count({ where }),
      db.shopProduct.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      }),
      db.shopProduct.findMany({
        where: { isActive: true },
        select: {
          price: true,
          salePrice: true,
          saleStartsAt: true,
          saleEndsAt: true,
          variants: {
            where: { isActive: true },
            select: { priceOverride: true },
          },
        },
      }),
    ]);
    const now = new Date();
    const productPrices = priceProducts.map((product) =>
      Math.min(
        ...product.variants.map((variant) =>
          getVariantPrice(product, variant, now),
        ),
        product.price,
      ),
    );
    const priceRange = {
      min: productPrices.length ? Math.min(...productPrices) : 0,
      max: productPrices.length ? Math.max(...productPrices) : 0,
    };
    let total = initialTotal;
    const orderBy = [{ createdAt: 'desc' as const }];

    let products;
    if (minPrice !== null || maxPrice !== null) {
      const allProducts = await db.shopProduct.findMany({
        where,
        include: {
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              sku: true,
              size: true,
              color: true,
              priceOverride: true,
              stock: true,
              reserved: true,
              soldCount: true,
            },
          },
        },
      });
      const matchingProducts = allProducts
        .map((product) => ({
          product,
          displayPrice: Math.min(
            ...product.variants.map((variant) =>
              getVariantPrice(product, variant, now),
            ),
            product.price,
          ),
        }))
        .filter(
          ({ displayPrice }) =>
            (minPrice === null || displayPrice >= minPrice) &&
            (maxPrice === null || displayPrice <= maxPrice),
        );

      if (sort === 'price-asc' || sort === 'price-desc') {
        const direction = sort === 'price-asc' ? 1 : -1;
        matchingProducts.sort(
          (a, b) =>
            direction * (a.displayPrice - b.displayPrice) ||
            b.product.createdAt.getTime() - a.product.createdAt.getTime(),
        );
      } else if (sort === 'popular') {
        matchingProducts.sort(
          (a, b) =>
            b.product.variants.reduce((sum, variant) => sum + variant.soldCount, 0) -
              a.product.variants.reduce((sum, variant) => sum + variant.soldCount, 0) ||
            b.product.createdAt.getTime() - a.product.createdAt.getTime(),
        );
      } else {
        matchingProducts.sort(
          (a, b) => b.product.createdAt.getTime() - a.product.createdAt.getTime(),
        );
      }
      total = matchingProducts.length;
      products = matchingProducts
        .slice((page - 1) * pageSize, page * pageSize)
        .map(({ product }) => product);
    } else if (sort === 'popular') {
      const [allProducts, sales] = await Promise.all([
        db.shopProduct.findMany({
          where,
          select: { id: true, createdAt: true },
        }),
        db.shopVariant.groupBy({
          by: ['productId'],
          where: { isActive: true, product: where },
          _sum: { soldCount: true },
        }),
      ]);
      const salesByProduct = new Map(
        sales.map(({ productId, _sum }) => [productId, _sum.soldCount ?? 0]),
      );
      const productIds = allProducts
        .sort(
          (a, b) =>
            (salesByProduct.get(b.id) ?? 0) -
              (salesByProduct.get(a.id) ?? 0) ||
            b.createdAt.getTime() - a.createdAt.getTime(),
        )
        .map(({ id }) => id)
        .slice((page - 1) * pageSize, page * pageSize);
      const selected = await db.shopProduct.findMany({
        where: { id: { in: productIds } },
        include: {
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              sku: true,
              size: true,
              color: true,
              priceOverride: true,
              stock: true,
              reserved: true,
              soldCount: true,
            },
          },
        },
      });
      const byId = new Map(selected.map((product) => [product.id, product]));
      products = productIds.flatMap((id) => {
        const product = byId.get(id);
        return product ? [product] : [];
      });
    } else if (sort === 'price-asc' || sort === 'price-desc') {
      const all = await db.shopProduct.findMany({
        where,
        include: {
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              sku: true,
              size: true,
              color: true,
              priceOverride: true,
              stock: true,
              reserved: true,
              soldCount: true,
            },
          },
        },
      });
      const direction = sort === 'price-asc' ? 1 : -1;
      products = all
        .map((product) => ({
          product,
          displayPrice: Math.min(
            ...product.variants.map((variant) =>
              getVariantPrice(product, variant, now),
            ),
            product.price,
          ),
        }))
        .sort((a, b) => direction * (a.displayPrice - b.displayPrice))
        .slice((page - 1) * pageSize, page * pageSize)
        .map(({ product }) => product);
    } else {
      products = await db.shopProduct.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              sku: true,
              size: true,
              color: true,
              priceOverride: true,
              stock: true,
              reserved: true,
              soldCount: true,
            },
          },
        },
      });
    }

    const reviewCounts = products.length
      ? await db.shopReview.groupBy({
          by: ['productId'],
          where: {
            productId: { in: products.map(({ id }) => id) },
            isPublished: true,
          },
          _avg: { rating: true },
          _count: { _all: true },
        })
      : [];
    const reviewsByProduct = new Map(
      reviewCounts.map((review) => [review.productId, review]),
    );
    return res.status(200).json({
      products: products.map((product) => ({
        ...product,
        displayPrice: Math.min(
          ...product.variants.map((variant) =>
            getVariantPrice(product, variant, now),
          ),
          product.price,
        ),
        regularPrice: Math.min(
          ...product.variants.map((variant) => variant.priceOverride ?? product.price),
          product.price,
        ),
        availableStock: product.variants.reduce(
          (sum, variant) => sum + getAvailableStock(variant),
          0,
        ),
        soldCount: product.variants.reduce(
          (sum, variant) => sum + variant.soldCount,
          0,
        ),
        averageRating: reviewsByProduct.get(product.id)?._avg.rating ?? 0,
        reviewCount: reviewsByProduct.get(product.id)?._count._all ?? 0,
      })),
      page,
      pageSize,
      total,
      pageCount: Math.ceil(total / pageSize),
      categories: categories.map(({ category }) => category),
      priceRange,
    });
  } catch (error) {
    console.error('Shop product listing error:', error);
    return res.status(500).json({ message: 'خطا در دریافت محصولات فروشگاه' });
  }
}
