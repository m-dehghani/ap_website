import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import ProductCard, { type ShopProductCardData } from '@/components/shop/ProductCard';
import SocialShare from '@/components/shop/SocialShare';
import { useAuth } from '@/hooks/useAuth';
import { formatToman } from '@/lib/format';
import { readShopCart, saveShopCart, type ShopCartLine } from '@/lib/shop-cart';
import { getPrisma } from '@/lib/db';

interface ProductSeoData {
  slug: string;
  name: string;
  description: string;
  image: string | null;
}

interface ProductVariant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  priceOverride: number | null;
  stock: number;
  reserved: number;
  soldCount: number;
}

export const getServerSideProps: GetServerSideProps<{
  productSeo: ProductSeoData;
}> = async ({ params }) => {
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  if (!slug) return { notFound: true };

  const db = await getPrisma();
  const product = await db.shopProduct.findFirst({
    where: { slug, isActive: true },
    select: {
      slug: true,
      name: true,
      shortDescription: true,
      description: true,
      images: true,
    },
  });
  if (!product) return { notFound: true };

  return {
    props: {
      productSeo: {
        slug: product.slug,
        name: product.name,
        description: product.shortDescription ?? product.description.slice(0, 160),
        image: product.images[0] ?? null,
      },
    },
  };
};

interface ProductDetail extends ShopProductCardData {
  description: string;
  salePrice: number | null;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  variants: ProductVariant[];
  reviews: Array<{
    id: string;
    rating: number;
    body: string;
    mediaUrls: string[];
    createdAt: string;
    user: { firstName: string; lastName: string };
  }>;
}

function unitPrice(product: ProductDetail, variant: ProductVariant) {
  const now = Date.now();
  const saleActive =
    product.salePrice !== null &&
    (!product.saleStartsAt || new Date(product.saleStartsAt).getTime() <= now) &&
    (!product.saleEndsAt || new Date(product.saleEndsAt).getTime() >= now);
  const regularPrice = variant.priceOverride ?? product.price;
  return saleActive && product.salePrice! < regularPrice
  ? product.salePrice!
  : regularPrice;
}

function isVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url);
}

function isImage(url: string) {
  return /\.(avif|gif|jpe?g|png|webp)(\?|#|$)/i.test(url);
}

export default function ShopProductPage({
  productSeo,
}: {
  productSeo: ProductSeoData;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [related, setRelated] = useState<ShopProductCardData[]>([]);
  const [variantId, setVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loadedSlug, setLoadedSlug] = useState('');
  const [error, setError] = useState('');
  const [reviewOrder, setReviewOrder] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState('');
  const [reviewMedia, setReviewMedia] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);

  useEffect(() => {
    if (!router.isReady || typeof router.query.slug !== 'string') return;
    const slug = router.query.slug;
    let active = true;
    void fetch(`/api/shop/products/${encodeURIComponent(slug)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'محصول پیدا نشد');
        if (active) {
          setProduct(data.product);
          setRelated(data.related);
          setVariantId(data.product.variants[0]?.id ?? '');
          setError('');
          setLoadedSlug(slug);
        }
      })
      .catch((loadError: unknown) => {
        console.error('Shop product load failed:', loadError);
        if (active) {
          setError('محصول در دسترس نیست.');
          setLoadedSlug(slug);
        }
      })
    return () => {
      active = false;
    };
  }, [router.isReady, router.query.slug]);

  const loading =
    !router.isReady ||
    typeof router.query.slug !== 'string' ||
    loadedSlug !== router.query.slug;

  const selectedVariant = useMemo(
    () => product?.variants.find((variant) => variant.id === variantId),
    [product, variantId],
  );
  const available = selectedVariant
    ? Math.max(selectedVariant.stock - selectedVariant.reserved, 0)
    : 0;

  const addToCart = () => {
    if (!product || !selectedVariant || available < quantity) return;
    const line: ShopCartLine = {
      variantId: selectedVariant.id,
      productSlug: product.slug,
      productName: product.name,
      image: product.images[0] ?? null,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: unitPrice(product, selectedVariant),
      quantity,
    };
    const cart = readShopCart();
    const existing = cart.find((item) => item.variantId === line.variantId);
    const nextQuantity = (existing?.quantity ?? 0) + line.quantity;
    if (nextQuantity > available || nextQuantity > 20) {
      toast.error('تعداد انتخاب‌شده از موجودی قابل خرید بیشتر است');
      return;
    }
    try {
      saveShopCart(
        existing
          ? cart.map((item) =>
              item.variantId === line.variantId
                ? { ...item, quantity: item.quantity + line.quantity }
                : item,
            )
          : [...cart, line],
      );
      toast.success('به سبد خرید اضافه شد');
    } catch (cartError) {
      toast.error(cartError instanceof Error ? cartError.message : 'ذخیره سبد خرید ناموفق بود');
    }
  };

  const shareUrl = `https://afshin-football.com/shop/${encodeURIComponent(
    product?.slug ?? productSeo.slug,
  )}`;
  const metaImage = product?.images[0] ?? productSeo.image;
  const metaTitle = product?.name ?? productSeo.name;
  const metaDescription =
    product?.shortDescription ?? productSeo.description;

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;
    setReviewBusy(true);
    try {
      const response = await fetch('/api/shop/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          orderNumber: reviewOrder,
          rating: reviewRating,
          body: reviewBody,
          mediaUrls: reviewMedia.split(/\r?\n/).map((url) => url.trim()).filter(Boolean),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'ثبت دیدگاه ناموفق بود');
      toast.success(data.message);
      setReviewOrder('');
      setReviewBody('');
      setReviewMedia('');
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : 'ثبت دیدگاه ناموفق بود');
    } finally {
      setReviewBusy(false);
    }
  };

  return (
    <Layout
      title={product?.name ?? productSeo.name}
      description={metaDescription}
      canonical={`https://afshin-football.com/shop/${encodeURIComponent(productSeo.slug)}`}
      openGraph={{
        type: 'product',
        title: metaTitle,
        description: metaDescription,
        images: metaImage
          ? [{
              url: metaImage,
              width: 1200,
              height: 900,
              alt: metaTitle,
            }]
          : undefined,
      }}
    >
      <div className="container-custom py-10">
        <Link href="/shop" className="text-sm font-semibold text-primary-700 hover:underline">
          ← بازگشت به فروشگاه
        </Link>
        {loading ? (
          <p role="status" className="py-16 text-center">در حال بارگذاری محصول...</p>
        ) : error || !product ? (
          <p role="alert" className="py-16 text-center text-rose-700">{error || 'محصول یافت نشد'}</p>
        ) : (
          <>
            <div className="mt-6 grid gap-8 lg:grid-cols-2">
              <div className="grid content-start gap-3 sm:grid-cols-2">
                {product.images.length ? product.images.map((image, index) => (
                  <div key={`${image}-${index}`} className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
                    <Image src={image} alt={`${product.name} - تصویر ${index + 1}`} fill unoptimized sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                  </div>
                )) : (
                  <div className="flex aspect-square items-center justify-center rounded-2xl bg-slate-100 text-6xl">⚽</div>
                )}
              </div>
              <div>
                <p className="font-semibold text-primary-700">{product.category}</p>
                <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{product.name}</h1>
                <p className="mt-3 text-slate-600">{product.shortDescription}</p>
                <div className="mt-3 flex items-center gap-2 text-amber-600">
                  <span>★ {product.averageRating.toFixed(1)} از ۵</span>
                  <span className="text-slate-500">({product.reviewCount} دیدگاه)</span>
                </div>
                <p className="mt-5 text-2xl font-bold text-slate-900">
                  {formatToman(selectedVariant ? unitPrice(product, selectedVariant) : product.displayPrice)}
                  {selectedVariant && unitPrice(product, selectedVariant) < (selectedVariant.priceOverride ?? product.price) && (
                    <del className="mr-3 text-base font-normal text-slate-500">
                      {formatToman(selectedVariant.priceOverride ?? product.price)}
                    </del>
                  )}
                </p>
                {product.isComingSoon ? (
                  <p className="mt-4 rounded-xl bg-amber-50 p-4 font-semibold text-amber-800">
                    این محصول به‌زودی موجود می‌شود{product.availableAt ? ` (${new Date(product.availableAt).toLocaleDateString('fa-IR')})` : ''}
                  </p>
                ) : product.variants.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    <label className="block">
                      <span className="mb-1 block font-semibold text-slate-800">انتخاب سایز و رنگ</span>
                      <select
                        value={variantId}
                        onChange={(event) => {
                          setVariantId(event.target.value);
                          setQuantity(1);
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3"
                      >
                        {product.variants.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {[variant.size, variant.color].filter(Boolean).join(' / ') || variant.sku}
                            {' — '}
                            {Math.max(variant.stock - variant.reserved, 0) > 0 ? `${Math.max(variant.stock - variant.reserved, 0)} موجود` : 'ناموجود'}
                          </option>
                        ))}
                      </select>
                    </label>
                    {available > 0 && available < 2 && (
                      <p role="status" className="font-semibold text-rose-700">این گزینه رو به اتمام است؛ فقط {available} عدد باقی مانده.</p>
                    )}
                    {available > 0 ? (
                      <div className="flex flex-wrap items-end gap-3">
                        <label>
                          <span className="mb-1 block text-sm font-semibold">تعداد</span>
                          <input
                            type="number"
                            min={1}
                            max={Math.min(available, 20)}
                            value={quantity}
                            onChange={(event) => setQuantity(Math.max(1, Math.min(Number(event.target.value) || 1, Math.min(available, 20))))}
                            className="w-24 rounded-lg border border-slate-300 px-3 py-3"
                          />
                        </label>
                        <button type="button" onClick={addToCart} className="btn btn-primary px-6 py-3">
                          افزودن به سبد خرید
                        </button>
                        <Link href="/shop/cart" className="btn btn-outline px-5 py-3">سبد خرید</Link>
                      </div>
                    ) : (
                      <p className="font-semibold text-slate-600">این گزینه در حال حاضر ناموجود است.</p>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-slate-600">گزینه‌ای برای خرید موجود نیست.</p>
                )}
                <div className="mt-6">
                  <SocialShare title={product.name} url={shareUrl} />
                </div>
              </div>
            </div>

            <section className="mt-14 max-w-4xl" aria-labelledby="product-description-title">
              <h2 id="product-description-title" className="text-2xl font-bold text-slate-900">توضیحات محصول</h2>
              <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-700">{product.description}</p>
            </section>

            <section className="mt-14" aria-labelledby="reviews-title">
              <h2 id="reviews-title" className="text-2xl font-bold text-slate-900">دیدگاه خریداران</h2>
              {product.reviews.length ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {product.reviews.map((review) => (
                    <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex justify-between gap-3">
                        <h3 className="font-bold">{review.user.firstName} {review.user.lastName}</h3>
                        <span className="text-amber-600" aria-label={`امتیاز ${review.rating} از ۵`}>{'★'.repeat(review.rating)}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-slate-700">{review.body}</p>
                      {review.mediaUrls.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-3">
                          {review.mediaUrls.map((url) => isVideo(url) ? (
                            <video key={url} controls preload="metadata" className="max-h-64 max-w-full rounded-lg" src={url}>مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.</video>
                          ) : isImage(url) ? (
                            <a key={url} href={url} target="_blank" rel="noreferrer" className="relative h-40 w-40 overflow-hidden rounded-lg">
                              <Image src={url} alt={`تصویر دیدگاه برای ${product.name}`} fill unoptimized sizes="160px" className="object-cover" />
                            </a>
                          ) : (
                            <a key={url} href={url} target="_blank" rel="noreferrer" className="text-sm text-primary-700 underline">
                              مشاهده تصویر یا رسانه
                            </a>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-slate-600">هنوز دیدگاهی برای این محصول ثبت نشده است.</p>
              )}
              {user?.role === 'STUDENT' ? (
                <form onSubmit={submitReview} className="mt-6 max-w-2xl space-y-4 rounded-2xl bg-slate-100 p-5">
                  <h3 className="text-lg font-bold">ثبت دیدگاه (فقط خریداران تأییدشده)</h3>
                  <label className="block">
                    <span className="mb-1 block">شماره سفارش پرداخت‌شده</span>
                    <input required value={reviewOrder} onChange={(event) => setReviewOrder(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block">امتیاز از ۱ تا ۵</span>
                    <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))} className="rounded-lg border border-slate-300 bg-white px-3 py-2">
                      {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} ستاره</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block">متن دیدگاه</span>
                    <textarea required minLength={3} maxLength={3000} value={reviewBody} onChange={(event) => setReviewBody(event.target.value)} rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block">پیوند تصویر یا ویدیو (هر پیوند در یک خط)</span>
                    <textarea value={reviewMedia} onChange={(event) => setReviewMedia(event.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                  </label>
                  <p className="text-sm text-slate-600">دیدگاه‌ها پس از تأیید مدیر فروشگاه نمایش داده می‌شوند.</p>
                  <button disabled={reviewBusy} type="submit" className="btn btn-primary px-5 py-3 disabled:opacity-50">
                    {reviewBusy ? 'در حال ثبت...' : 'ثبت دیدگاه'}
                  </button>
                </form>
              ) : (
                <p className="mt-5 text-sm text-slate-600">
                  برای ثبت دیدگاه تأییدشده باید با حساب خریدار وارد شوید. خرید مهمان نیز امکان‌پذیر است.
                </p>
              )}
            </section>

            {related.length > 0 && (
              <section className="mt-16" aria-labelledby="related-title">
                <h2 id="related-title" className="mb-5 text-2xl font-bold text-slate-900">محصولات مرتبط</h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {related.map((item) => <ProductCard key={item.id} product={item} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
