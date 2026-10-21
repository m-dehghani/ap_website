import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Layout from '@/components/Layout';
import ProductCard, {
  type ShopProductCardData,
} from '@/components/shop/ProductCard';

interface ShopListing {
  products: ShopProductCardData[];
  page: number;
  pageCount: number;
  total: number;
  categories: string[];
}

export default function ShopPage() {
  const [listing, setListing] = useState<ShopListing | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('recent');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      sort,
      ...(category ? { category } : {}),
      ...(query ? { search: query } : {}),
      ...(priceRange.min ? { minPrice: priceRange.min } : {}),
      ...(priceRange.max ? { maxPrice: priceRange.max } : {}),
    });
    let active = true;
    void fetch(`/api/shop/products?${params}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || 'دریافت محصولات ناموفق بود');
        if (active) setListing(data);
      })
      .catch((loadError: unknown) => {
        console.error('Shop catalog request failed:', loadError);
        if (active)
          setError('در دریافت محصولات مشکلی پیش آمد. دوباره تلاش کنید.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, sort, category, query, priceRange]);

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = search.trim();
    const nextMinPrice = minPrice.trim();
    const nextMaxPrice = maxPrice.trim();
    const parsedMinPrice = nextMinPrice ? Number(nextMinPrice) : null;
    const parsedMaxPrice = nextMaxPrice ? Number(nextMaxPrice) : null;
    if (
      (parsedMinPrice !== null &&
        (!Number.isSafeInteger(parsedMinPrice) || parsedMinPrice < 0)) ||
      (parsedMaxPrice !== null &&
        (!Number.isSafeInteger(parsedMaxPrice) ||
          parsedMaxPrice < 0 ||
          parsedMaxPrice > 2_147_483_647)) ||
      (parsedMinPrice !== null &&
        (parsedMinPrice > 2_147_483_647 ||
          (parsedMaxPrice !== null && parsedMinPrice > parsedMaxPrice)))
    ) {
      setError('محدوده قیمت را به‌صورت عدد صحیح معتبر وارد کنید.');
      return;
    }
    setError('');
    const nextPriceRange = { min: nextMinPrice, max: nextMaxPrice };
    if (
      nextQuery !== query ||
      nextPriceRange.min !== priceRange.min ||
      nextPriceRange.max !== priceRange.max
    ) {
      setLoading(true);
      setError('');
      setPage(1);
      setQuery(nextQuery);
      setPriceRange(nextPriceRange);
    }
  };

  return (
    <Layout
      title="فروشگاه تجهیزات فوتبال"
      description="خرید کفش، لباس و تجهیزات فوتبال"
    >
      <section className="bg-linear-to-br from-slate-950 to-primary-900 py-14 text-white">
        <div className="container-custom">
          <h1 className="mt-2 text-4xl font-extrabold">
            تجهیزات بازی را پیدا کن
          </h1>
        </div>
      </section>

      <section className="container-custom py-10">
        <form
          onSubmit={applyFilters}
          className="mb-6 grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6"
        >
          <label className="sr-only" htmlFor="shop-search">
            جستجوی محصول
          </label>
          <input
            id="shop-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجوی کفش، لباس و..."
            className="rounded-lg border border-slate-300 px-4 py-3 lg:col-span-2"
          />
          <label className="sr-only" htmlFor="shop-category">
            دسته‌بندی
          </label>
          <select
            id="shop-category"
            value={category}
            onChange={(event) => {
              setLoading(true);
              setError('');
              setCategory(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3"
          >
            <option value="">همه دسته‌ها</option>
            {listing?.categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="shop-sort">
            مرتب‌سازی
          </label>
          <select
            id="shop-sort"
            value={sort}
            onChange={(event) => {
              setLoading(true);
              setError('');
              setSort(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3"
          >
            <option value="recent">جدیدترین</option>
            <option value="popular">پرفروش‌ترین</option>
            <option value="price-asc">ارزان‌ترین</option>
            <option value="price-desc">گران‌ترین</option>
          </select>
          <label className="sr-only" htmlFor="shop-min-price">
            حداقل قیمت به تومان
          </label>
          <input
            id="shop-min-price"
            type="number"
            min={0}
            max={2_147_483_647}
            step={1000}
            inputMode="numeric"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="حداقل قیمت (تومان)"
            className="min-w-0 rounded-lg border border-slate-300 px-4 py-3"
          />
          <label className="sr-only" htmlFor="shop-max-price">
            حداکثر قیمت به تومان
          </label>
          <input
            id="shop-max-price"
            type="number"
            min={0}
            max={2_147_483_647}
            step={1000}
            inputMode="numeric"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="حداکثر قیمت (تومان)"
            className="min-w-0 rounded-lg border border-slate-300 px-4 py-3"
          />
          <button
            type="submit"
            className="btn btn-primary px-5 py-3 lg:col-span-2"
          >
            جستجو و فیلتر
          </button>
        </form>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl bg-rose-50 p-4 text-rose-800"
          >
            {error}
          </div>
        )}
        {loading ? (
          <p role="status" className="py-16 text-center text-slate-600">
            در حال بارگذاری محصولات...
          </p>
        ) : listing?.products.length ? (
          <>
            <p className="mb-5 text-sm text-slate-600">{listing.total} محصول</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listing.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {listing.pageCount > 1 && (
              <nav
                className="mt-10 flex items-center justify-center gap-3"
                aria-label="صفحه‌بندی محصولات"
              >
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => {
                    setLoading(true);
                    setPage((current) => current - 1);
                  }}
                  className="btn btn-outline px-4 py-2 disabled:opacity-40"
                >
                  قبلی
                </button>
                <span aria-live="polite">
                  صفحه {page} از {listing.pageCount}
                </span>
                <button
                  type="button"
                  disabled={page >= listing.pageCount}
                  onClick={() => {
                    setLoading(true);
                    setPage((current) => current + 1);
                  }}
                  className="btn btn-outline px-4 py-2 disabled:opacity-40"
                >
                  بعدی
                </button>
              </nav>
            )}
          </>
        ) : (
          <p className="py-16 text-center text-slate-600">
            محصولی با این مشخصات پیدا نشد.
          </p>
        )}
      </section>
    </Layout>
  );
}
