import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useSyncExternalStore } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { formatToman } from '@/lib/format';
import {
  getShopFavoritesSnapshot,
  parseShopFavoritesSnapshot,
  subscribeShopStorage,
  toggleShopFavorite,
} from '@/lib/shop-cart';

export interface ShopProductCardData {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string | null;
  images: string[];
  price: number;
  displayPrice: number;
  regularPrice: number;
  isComingSoon: boolean;
  availableAt: string | null;
  availableStock: number;
  averageRating: number;
  reviewCount: number;
  soldCount?: number;
}

export default function ProductCard({
  product,
}: {
  product: ShopProductCardData;
}) {
  const image = product.images[0];
  const discounted = product.displayPrice < product.regularPrice;
  const averageRating = Number.isFinite(product.averageRating)
    ? product.averageRating
    : 0;
  const reviewCount = Number.isSafeInteger(product.reviewCount)
    ? product.reviewCount
    : 0;
  const subscribe = useCallback(
    (onChange: () => void) => subscribeShopStorage('ap-shop-favorites', onChange),
    [],
  );
  const getSnapshot = useCallback(
    () => parseShopFavoritesSnapshot(getShopFavoritesSnapshot()).includes(product.slug),
    [product.slug],
  );
  const favorite = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const toggleFavorite = () => {
    try {
      toggleShopFavorite(product.slug);
    } catch (error) {
      console.error('Shop favorite update error:', error);
    }
  };

  return (
    <article className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:z-10 hover:scale-[1.025] hover:shadow-xl focus-within:z-10 focus-within:scale-[1.025]">
      <Link
        href={`/shop/${encodeURIComponent(product.slug)}`}
        aria-label={`مشاهده ${product.name}`}
        className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-slate-100">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105"
            />
          ) : (
            <div
              role="img"
              aria-label={`تصویر ${product.name} موجود نیست`}
              className="flex h-full items-center justify-center text-5xl text-slate-300"
            >
              ⚽
            </div>
          )}
          {product.displayPrice < product.regularPrice && (
            <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white">
              تخفیف
            </span>
          )}
          {product.isComingSoon && (
            <span className="absolute bottom-3 right-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
              به‌زودی
            </span>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold text-primary-700">{product.category}</p>
          <h3 className="mt-1 rounded font-bold text-slate-900 group-hover:text-primary-700">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center gap-1 text-sm text-amber-600">
            <span aria-label={`امتیاز ${averageRating.toFixed(1)} از ۵`}>★</span>
            <span>{averageRating.toFixed(1)}</span>
            <span className="text-slate-500">({reviewCount} دیدگاه)</span>
          </div>
          <p className="mt-2 font-bold text-slate-900">
            {formatToman(product.displayPrice)}
            {discounted && (
              <del className="mr-2 text-sm font-normal text-slate-500">
                {formatToman(product.regularPrice)}
              </del>
            )}
          </p>
          <div className="max-h-0 overflow-hidden transition-[max-height] duration-200 group-hover:max-h-24 group-focus-visible:max-h-24">
            <p className="pt-2 text-sm text-slate-600">
              {product.shortDescription || 'مشاهده توضیحات و انتخاب گزینه‌ها'}
            </p>
            {product.availableStock > 0 && product.availableStock < 2 && (
              <p className="mt-1 text-sm font-semibold text-rose-700">
                فقط {product.availableStock} عدد باقی مانده
              </p>
            )}
          </div>
          {product.availableStock === 0 && !product.isComingSoon && (
            <p className="mt-2 text-sm text-slate-500">ناموجود</p>
          )}
        </div>
      </Link>
      <button
        type="button"
        onClick={toggleFavorite}
        aria-label={
          favorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'
        }
        aria-pressed={favorite}
        className="absolute left-3 top-3 z-10 rounded-full bg-white/95 p-2 text-rose-600 shadow transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        {favorite ? (
          <HeartSolidIcon className="h-5 w-5" />
        ) : (
          <HeartIcon className="h-5 w-5" />
        )}
      </button>
    </article>
  );
}
