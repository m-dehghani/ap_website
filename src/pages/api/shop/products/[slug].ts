import type { NextApiRequest, NextApiResponse } from 'next';
import { getOptionalAccountId } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { getAvailableStock, getVariantPrice } from '@/lib/shop';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const slug = typeof req.query.slug === 'string' ? req.query.slug : '';
  if (!slug) return res.status(400).json({ message: 'محصول معتبر نیست' });

  try {
    const db = await getPrisma();
    const product = await db.shopProduct.findFirst({
      where: { slug, isActive: true },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: [{ size: 'asc' }, { color: 'asc' }],
        },
        reviews: {
          where: { isPublished: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            userId: true,
            rating: true,
            body: true,
            mediaUrls: true,
            createdAt: true,
            user: { select: { firstName: true, lastName: true } },
            votes: { select: { userId: true, vote: true } },
          },
        },
      },
    });
    if (!product) return res.status(404).json({ message: 'محصول یافت نشد' });
    const viewerId = await getOptionalAccountId(req);
    const helpfulScores = new Map<string, number>();
    const reviews = product.reviews
      .map(({ votes, ...review }) => {
        const likes = votes.filter(({ vote }) => vote === 1).length;
        const dislikes = votes.filter(({ vote }) => vote === -1).length;
        helpfulScores.set(review.id, likes - dislikes);
        return {
          ...review,
          likes,
          dislikes,
          viewerVote: votes.find(({ userId }) => userId === viewerId)?.vote ?? 0,
          canVote: Boolean(viewerId) && review.userId !== viewerId,
        };
      })
      .sort(
        (first, second) =>
          (helpfulScores.get(second.id) ?? 0) -
            (helpfulScores.get(first.id) ?? 0) ||
          second.likes - first.likes ||
          second.createdAt.getTime() - first.createdAt.getTime(),
      );

    const [rating, related] = await Promise.all([
      db.shopReview.aggregate({
        where: { productId: product.id, isPublished: true },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      db.shopProduct.findMany({
        where: {
          isActive: true,
          isComingSoon: false,
          category: product.category,
          id: { not: product.id },
        },
        take: 4,
        orderBy: { createdAt: 'desc' },
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
      }),
    ]);
    const relatedRatings = related.length
      ? await db.shopReview.groupBy({
          by: ['productId'],
          where: {
            productId: { in: related.map(({ id }) => id) },
            isPublished: true,
          },
          _avg: { rating: true },
          _count: { _all: true },
        })
      : [];
    const ratingsByProductId = new Map(
      relatedRatings.map((relatedRating) => [
        relatedRating.productId,
        relatedRating,
      ]),
    );
    const now = new Date();
    return res.status(200).json({
      product: {
        ...product,
        reviews,
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
        averageRating: rating._avg.rating ?? 0,
        reviewCount: rating._count._all,
      },
      related: related.map((item) => ({
        ...item,
        displayPrice: Math.min(
          ...item.variants.map((variant) =>
            getVariantPrice(item, variant, now),
          ),
          item.price,
        ),
        regularPrice: Math.min(
          ...item.variants.map((variant) => variant.priceOverride ?? item.price),
          item.price,
        ),
        availableStock: item.variants.reduce(
          (sum, variant) => sum + getAvailableStock(variant),
          0,
        ),
        averageRating: ratingsByProductId.get(item.id)?._avg.rating ?? 0,
        reviewCount: ratingsByProductId.get(item.id)?._count._all ?? 0,
      })),
    });
  } catch (error) {
    console.error('Shop product detail error:', error);
    return res.status(500).json({ message: 'خطا در دریافت اطلاعات محصول' });
  }
}
