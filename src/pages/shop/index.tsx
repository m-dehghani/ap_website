import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';
import ProductCard, {
  type ShopProductCardData,
} from '@/components/shop/ProductCard';
import { formatToman } from '@/lib/format';

const MAX_PRICE = 2_147_483_000;
const PRICE_STEP = 1_000;

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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterToggleRef = useRef<HTMLButtonElement>(null);
  const filterCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!filtersOpen) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFiltersOpen(false);
      if (event.key === 'Tab') {
        const focusable = Array.from(
          document.querySelectorAll<HTMLElement>(
            '#shop-filters button:not([disabled]), #shop-filters input:not([disabled]), #shop-filters select:not([disabled])',
          ),
        ).filter((element) => element.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    filterCloseRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [filtersOpen]);

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
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    const hasActiveFilters =
      Boolean(search || query || category || minPrice || maxPrice) ||
      sort !== 'recent' ||
      Boolean(priceRange.min || priceRange.max) ||
      page !== 1;
    if (hasActiveFilters) setLoading(true);
    setError('');
    setSearch('');
    setQuery('');
    setCategory('');
    setSort('recent');
    setMinPrice('');
    setMaxPrice('');
    setPriceRange({ min: '', max: '' });
    setPage(1);
    setFiltersOpen(false);
  };

  return (
    <Layout
      title="فروشگاه تجهیزات فوتبال"
      description="خرید کفش، لباس و تجهیزات فوتبال"
    >
      <section className="relative isolate overflow-hidden bg-linear-to-bl from-red-800 via-red-700 to-rose-600 py-7 text-white sm:py-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-28 size-56 rounded-full border-[18px] border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-1/3 size-64 rounded-full bg-red-950/20 blur-3xl"
        />
        <div className="container-custom relative">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-red-50 sm:text-sm">
              فروشگاه آکادمی فوتبال
            </p>
            <h1 className="mt-2 text-[clamp(1.5rem,3.5vw,2.4rem)] font-extrabold leading-tight text-white">
              تجهیزات بازی را پیدا کن
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-red-50 sm:text-base">
              تجهیزات تمرین و بازی آکادمی را پیدا کن.
            </p>
          </div>
        </div>
      </section>

      <section id="shop-catalog" className="container-custom scroll-mt-6 py-6 sm:py-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
              محصولات فروشگاه
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              تجهیزات مناسب تمرینت را پیدا کن.
            </p>
          </div>
          <button
            ref={filterToggleRef}
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="shop-filters"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-800 shadow-sm transition hover:border-red-300 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 lg:hidden"
          >
            <Bars3Icon aria-hidden="true" className="size-5" />
            فیلترها
          </button>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside
            id="shop-filters"
            aria-label="فیلتر محصولات"
            role={filtersOpen ? 'dialog' : undefined}
            aria-modal={filtersOpen ? true : undefined}
            aria-labelledby="shop-filter-title"
            className={`${filtersOpen ? 'block' : 'hidden'} fixed inset-0 z-50 lg:sticky lg:inset-auto lg:top-5 lg:col-start-1 lg:row-start-1 lg:block`}
          >
            <button
              type="button"
              tabIndex={-1}
              aria-label="بستن فیلترها"
              onClick={() => setFiltersOpen(false)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] lg:hidden"
            />
            <form
              onSubmit={applyFilters}
              className="absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col overflow-y-auto border-l border-red-100 bg-white shadow-2xl lg:static lg:w-auto lg:rounded-2xl lg:border lg:shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-red-100 bg-linear-to-l from-red-50 to-white px-5 py-4">
                <div>
                  <h2 id="shop-filter-title" className="text-lg font-extrabold text-red-950">
                    فیلتر محصولات
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-600">انتخاب سریع محصول</p>
                </div>
                <button
                  ref={filterCloseRef}
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="بستن فیلترها"
                  className="flex size-11 items-center justify-center rounded-xl text-red-800 transition hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-700 lg:hidden"
                >
                  <XMarkIcon aria-hidden="true" className="size-5" />
                </button>
              </div>
              <div className="flex-1 space-y-5 p-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="shop-search">
                    جستجوی محصول
                  </label>
                  <input
                    id="shop-search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="مثلاً کفش، لباس و..."
                    className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base text-slate-900 placeholder:text-slate-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="shop-category">
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
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
                  >
                    <option value="">همه دسته‌ها</option>
                    {listing?.categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700" htmlFor="shop-sort">
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
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
                  >
                    <option value="recent">جدیدترین</option>
                    <option value="popular">پرفروش‌ترین</option>
                    <option value="price-asc">ارزان‌ترین</option>
                    <option value="price-desc">گران‌ترین</option>
                  </select>
                </div>
                <fieldset className="space-y-4 rounded-xl border border-red-100 bg-red-50/60 p-4">
                  <legend className="px-1 text-sm font-bold text-red-950">محدوده قیمت</legend>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-sm font-medium text-slate-700" htmlFor="shop-min-price">
                        حداقل
                      </label>
                      <output htmlFor="shop-min-price" className="text-sm font-bold text-red-800">
                        {minPrice && Number(minPrice) > 0
                          ? formatToman(Number(minPrice))
                          : 'بدون محدودیت'}
                      </output>
                    </div>
                    <input
                      id="shop-min-price"
                      type="range"
                      min={0}
                      max={MAX_PRICE}
                      step={PRICE_STEP}
                      value={minPrice || 0}
                      aria-valuetext={formatToman(Number(minPrice || 0))}
                      onChange={(event) => {
                        const nextMin = Number(event.target.value);
                        const value = Math.min(nextMin, Number(maxPrice || MAX_PRICE));
                        setMinPrice(value === 0 ? '' : String(value));
                      }}
                      className="shop-price-slider"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-sm font-medium text-slate-700" htmlFor="shop-max-price">
                        حداکثر
                      </label>
                      <output htmlFor="shop-max-price" className="text-sm font-bold text-red-800">
                        {maxPrice && Number(maxPrice) < MAX_PRICE
                          ? formatToman(Number(maxPrice))
                          : 'بدون محدودیت'}
                      </output>
                    </div>
                    <input
                      id="shop-max-price"
                      type="range"
                      min={0}
                      max={MAX_PRICE}
                      step={PRICE_STEP}
                      value={maxPrice || MAX_PRICE}
                      aria-valuetext={
                        maxPrice ? formatToman(Number(maxPrice)) : 'بدون محدودیت'
                      }
                      onChange={(event) => {
                        const nextMax = Number(event.target.value);
                        const value = Math.max(nextMax, Number(minPrice || 0));
                        setMaxPrice(value >= MAX_PRICE ? '' : String(value));
                      }}
                      className="shop-price-slider"
                      dir="ltr"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500" dir="ltr">
                    <span>۰ تومان</span>
                    <span>حداکثر قیمت</span>
                  </div>
                </fieldset>
              </div>
              <div className="space-y-2 border-t border-slate-200 bg-white p-4">
                <button
                  type="submit"
                  className="btn btn-primary min-h-11 w-full px-5 py-2.5"
                >
                  نمایش محصولات
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="min-h-11 w-full rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                >
                  پاک کردن فیلترها
                </button>
              </div>
            </form>
          </aside>

          <div className="min-w-0 lg:col-start-2 lg:row-start-1">
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl bg-rose-50 p-4 text-rose-800"
          >
            {error}
          </div>
        )}
        {loading ? (
          <p role="status" className="rounded-2xl bg-white px-4 py-16 text-center text-base text-slate-600 shadow-sm">
            در حال بارگذاری محصولات...
          </p>
        ) : listing?.products.length ? (
          <>
            <p className="mb-3 text-sm font-medium text-slate-600 sm:text-base">{listing.total} محصول</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
              {listing.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {listing.pageCount > 1 && (
              <nav
                className="mt-8 flex flex-wrap items-center justify-center gap-3"
                aria-label="صفحه‌بندی محصولات"
              >
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => {
                    setLoading(true);
                    setPage((current) => current - 1);
                  }}
                  className="btn btn-outline min-h-11 px-4 py-2 disabled:opacity-40"
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
                  className="btn btn-outline min-h-11 px-4 py-2 disabled:opacity-40"
                >
                  بعدی
                </button>
              </nav>
            )}
          </>
        ) : (
          <p className="rounded-2xl border border-slate-200 bg-white px-4 py-16 text-center text-base text-slate-600 shadow-sm">
            محصولی با این مشخصات پیدا نشد.
          </p>
        )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
