import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Layout from '@/components/Layout';
import { formatToman } from '@/lib/format';
import {
  getShopCartSnapshot,
  parseShopCartSnapshot,
  saveShopCart,
  subscribeShopStorage,
  type ShopCartLine,
} from '@/lib/shop-cart';

interface CheckoutValues {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  province: string;
  city: string;
  postalCode: string;
}

interface Province {
  id: string;
  name: string;
  nameEn?: string | null;
  shippingFee: number;
}

interface City {
  id: string;
  name: string;
  nameEn?: string | null;
  shippingFee: number | null;
}

const emptyCheckout: CheckoutValues = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  province: '',
  city: '',
  postalCode: '',
};

export default function ShopCartPage() {
  const [values, setValues] = useState(emptyCheckout);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [shippingError, setShippingError] = useState('');
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const cartSnapshot = useSyncExternalStore(
    (onChange) => subscribeShopStorage('ap-shop-cart', onChange),
    getShopCartSnapshot,
    () => '[]',
  );
  const cart = useMemo(() => parseShopCartSnapshot(cartSnapshot), [cartSnapshot]);

  // Load provinces on mount
  useEffect(() => {
    void fetch('/api/admin/content/provinces')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'دریافت استان‌ها ناموفق بود');
        setProvinces(data);
      })
      .catch((provinceError: unknown) => {
        console.error('Province load failed:', provinceError);
        toast.error('لیست استان‌ها دریافت نشد');
      });
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (!values.province) {
      setCities([]);
      setValues((prev) => ({ ...prev, city: '' }));
      return;
    }
    void fetch(`/api/admin/content/cities?province=${encodeURIComponent(values.province)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'دریافت شهرها ناموفق بود');
        setCities(data);
        // Reset city if it's not in the new list
        if (values.city && !data.some((c: City) => c.name === values.city)) {
          setValues((prev) => ({ ...prev, city: '' }));
        }
      })
      .catch((cityError: unknown) => {
        console.error('City load failed:', cityError);
        toast.error('لیست شهرها دریافت نشد');
      });
  }, [values.province]);

  // Load shipping fee settings on mount
  useEffect(() => {
    void fetch('/api/shop/settings')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'دریافت هزینه ارسال ناموفق بود');
        setShippingFee(data.shippingFee);
        setShippingError('');
      })
      .catch((settingsError: unknown) => {
        console.error('Shop shipping fee load failed:', settingsError);
        setShippingError('هزینه ارسال دریافت نشد؛ جمع نهایی هنگام ثبت سفارش دوباره محاسبه می‌شود.');
      });
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  const updateCart = (next: ShopCartLine[]) => {
    try {
      saveShopCart(next);
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'ذخیره سبد خرید ناموفق بود');
    }
  };

  const handleProvinceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceName = event.target.value;
    setValues((prev) => ({ ...prev, province: provinceName, city: '' }));
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = event.target.value;
    setValues((prev) => ({ ...prev, city: cityName }));
  };

  const submitCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/shop/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          expectedSubtotal: subtotal,
          expectedShippingFee: shippingFee,
          items: cart.map(({ variantId, quantity }) => ({ variantId, quantity })),
        }),
      });
      const data = await response.json();
      if (data.code === 'PRICE_CHANGED') {
        const updatedPrices = new Map<string, number>(
          (Array.isArray(data.prices) ? data.prices : [])
            .filter(
              (item: unknown): item is { variantId: string; unitPrice: number } =>
                typeof item === 'object' &&
                item !== null &&
                'variantId' in item &&
                typeof item.variantId === 'string' &&
                'unitPrice' in item &&
                typeof item.unitPrice === 'number',
            )
            .map((item: { variantId: string; unitPrice: number }) => [
              item.variantId,
              item.unitPrice,
            ] as const),
        );
        updateCart(
          cart.map((item) => ({
            ...item,
            price: updatedPrices.get(item.variantId) ?? item.price,
          })),
        );
        setShippingFee(data.shippingFee);
      }
      if (!response.ok) throw new Error(data.message || 'ثبت سفارش انجام نشد');
      if (typeof data.paymentUrl !== 'string') {
        throw new Error('پیوند پرداخت معتبر نیست');
      }
      window.location.assign(data.paymentUrl);
    } catch (checkoutError) {
      console.error('Shop checkout request failed:', checkoutError);
      const message =
        checkoutError instanceof Error
          ? checkoutError.message
          : 'ثبت سفارش انجام نشد';
      setError(message);
      setBusy(false);
    }
  };

  return (
    <Layout title="سبد خرید و پرداخت" description="تکمیل سفارش فروشگاه آکادمی">
      <div className="container-custom py-10">
        <h1 className="text-3xl font-extrabold text-slate-900">سبد خرید</h1>
        {cart.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-slate-700">سبد خرید شما خالی است.</p>
            <Link href="/shop" className="btn btn-primary mt-5 inline-flex px-5 py-3">
              رفتن به فروشگاه
            </Link>
          </div>
        ) : (
          <div className="mt-7 grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
            <section aria-label="اقلام سبد خرید" className="space-y-3">
              {cart.map((item) => (
                <article key={item.variantId} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                  {item.image ? (
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                      <Image src={item.image} alt="" fill unoptimized sizes="96px" className="object-cover" />
                    </div>
                  ) : (
                    <div aria-hidden="true" className="flex h-24 w-24 items-center justify-center rounded-xl bg-slate-100 text-3xl">⚽</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link href={`/shop/${encodeURIComponent(item.productSlug)}`} className="font-bold text-slate-900 hover:text-primary-700">
                      {item.productName}
                    </Link>
                    <p className="mt-1 text-sm text-slate-600">{[item.size, item.color].filter(Boolean).join(' / ')}</p>
                    <p className="mt-1 font-semibold">{formatToman(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <label className="sr-only" htmlFor={`quantity-${item.variantId}`}>تعداد {item.productName}</label>
                      <input
                        id={`quantity-${item.variantId}`}
                        type="number"
                        min={1}
                        max={20}
                        value={item.quantity}
                        onChange={(event) => {
                          const quantity = Math.max(1, Math.min(20, Number(event.target.value) || 1));
                          updateCart(cart.map((line) => line.variantId === item.variantId ? { ...line, quantity } : line));
                        }}
                        className="w-20 rounded-lg border border-slate-300 px-2 py-1"
                      />
                      <button
                        type="button"
                        onClick={() => updateCart(cart.filter((line) => line.variantId !== item.variantId))}
                        className="text-sm font-semibold text-rose-700 underline"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                  <p className="text-left font-bold text-slate-800">
                    {formatToman(item.price * item.quantity)}
                  </p>
                </article>
              ))}
              <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
                جمع اقلام: <strong className="text-slate-900">{formatToman(subtotal)}</strong>
                <p className="mt-1">هزینه ارسال: {shippingFee === null ? 'در حال دریافت...' : formatToman(shippingFee)}</p>
                {shippingFee !== null && <p className="mt-1 font-semibold text-slate-900">جمع با ارسال (برآورد): {formatToman(subtotal + shippingFee)}</p>}
                {shippingError && <p role="status" className="mt-1 text-amber-800">{shippingError}</p>}
                <p className="mt-1">موجودی و قیمت نهایی پیش از انتقال به درگاه دوباره بررسی می‌شود.</p>
              </div>
            </section>

            <form onSubmit={submitCheckout} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold text-slate-900">اطلاعات گیرنده و ارسال</h2>
              {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-rose-800">{error}</p>}
              <label className="block">
                <span className="mb-1 block font-semibold">نام و نام خانوادگی</span>
                <input required minLength={3} maxLength={120} autoComplete="name" value={values.fullName} onChange={(event) => setValues({ ...values, fullName: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-3" />
              </label>
              <label className="block">
                <span className="mb-1 block font-semibold">شماره تماس</span>
                <input required type="tel" autoComplete="tel" value={values.phone} onChange={(event) => setValues({ ...values, phone: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-3" />
              </label>
              <label className="block">
                <span className="mb-1 block font-semibold">ایمیل (اختیاری)</span>
                <input type="email" autoComplete="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-3" />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block font-semibold">استان</span>
                  <select
                    required
                    value={values.province}
                    onChange={handleProvinceChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-3 bg-white"
                  >
                    <option value="">استان را انتخاب کنید</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block font-semibold">شهر</span>
                  <select
                    required
                    value={values.city}
                    onChange={handleCityChange}
                    disabled={cities.length === 0}
                    className="w-full rounded-lg border border-slate-300 px-3 py-3 bg-white disabled:bg-slate-100"
                  >
                    <option value="">شهر را انتخاب کنید</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block font-semibold">نشانی کامل</span>
                <textarea required minLength={10} autoComplete="street-address" rows={3} value={values.address} onChange={(event) => setValues({ ...values, address: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-3" />
              </label>
              <label className="block">
                <span className="mb-1 block font-semibold">کد پستی ۱۰ رقمی</span>
                <input required inputMode="numeric" pattern="[0-9۰-۹٠-٩]{10}" autoComplete="postal-code" value={values.postalCode} onChange={(event) => setValues({ ...values, postalCode: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-3" />
              </label>
              <button disabled={busy || cart.length === 0} type="submit" className="btn btn-primary w-full px-5 py-3 disabled:opacity-50">
                {busy ? 'در حال انتقال به درگاه...' : 'پرداخت با زرین‌پال'}
              </button>
              <p className="text-center text-xs text-slate-500">پرداخت امن از طریق درگاه زرین‌پال انجام می‌شود.</p>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}