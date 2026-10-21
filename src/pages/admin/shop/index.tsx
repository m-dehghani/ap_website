import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import { formatPersianDate, formatToman } from '@/lib/format';

interface ShopVariantForm {
  sku: string;
  size: string;
  color: string;
  priceOverride: string;
  stock: string;
  isActive: boolean;
}

interface ShopProductForm {
  id?: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  shortDescription: string;
  images: string;
  price: string;
  salePrice: string;
  saleStartsAt: string;
  saleEndsAt: string;
  isActive: boolean;
  isComingSoon: boolean;
  availableAt: string;
  featured: boolean;
  variants: ShopVariantForm[];
}

interface ManagedProduct extends Omit<ShopProductForm, 'id'> {
  id: string;
}

interface ShopProductRecord extends Omit<
  ShopProductForm,
  'id' | 'images' | 'price' | 'salePrice' | 'saleStartsAt' | 'saleEndsAt' | 'availableAt' | 'variants'
> {
  id: string;
  images: string[];
  price: number;
  salePrice: number | null;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  availableAt: string | null;
  variants: Array<Omit<ShopVariantForm, 'stock' | 'priceOverride'> & {
    id: string;
    stock: number;
    priceOverride: number | null;
  }>;
}

interface ShopOrder {
  id: string;
  orderNumber: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string;
  province: string | null;
  city: string;
  postalCode: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{ id: string; productName: string; sku: string; size: string | null; color: string | null; quantity: number }>;
}

interface ShopReview {
  id: string;
  rating: number;
  body: string;
  mediaUrls: string[];
  isPublished: boolean;
  createdAt: string;
  product: { name: string; slug: string };
  user: { firstName: string; lastName: string };
}

const newProduct = (): ShopProductForm => ({
  slug: '',
  name: '',
  category: '',
  description: '',
  shortDescription: '',
  images: '',
  price: '',
  salePrice: '',
  saleStartsAt: '',
  saleEndsAt: '',
  isActive: false,
  isComingSoon: false,
  availableAt: '',
  featured: false,
  variants: [{ sku: '', size: '', color: '', priceOverride: '', stock: '0', isActive: true }],
});

const orderStatusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'در انتظار پرداخت',
  PAID: 'پرداخت‌شده',
  PROCESSING: 'در حال آماده‌سازی',
  SHIPPED: 'ارسال‌شده',
  DELIVERED: 'تحویل‌شده',
  CANCELLED: 'لغوشده',
  PAYMENT_FAILED: 'پرداخت ناموفق',
  REFUND_REQUIRED: 'نیازمند پیگیری بازپرداخت',
};

function toDateInput(value: string | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

function dateInputToIranBoundary(value: string, endOfDay = false) {
  if (!value) return null;
  const time = endOfDay ? 'T23:59:59.999+03:30' : 'T00:00:00.000+03:30';
  const date = new Date(`${value}${time}`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export default function ShopAdminPage() {
  const [section, setSection] = useState<'products' | 'orders' | 'reviews' | 'settings'>('products');
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [reviews, setReviews] = useState<ShopReview[]>([]);
  const [shippingFee, setShippingFee] = useState('0');
  const [form, setForm] = useState<ShopProductForm>(newProduct());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    try {
      const [productResponse, orderResponse, reviewResponse, settingsResponse] =
        await Promise.all([
          fetch('/api/admin/shop/products'),
          fetch('/api/admin/shop/orders'),
          fetch('/api/admin/shop/reviews'),
          fetch('/api/admin/shop/settings'),
        ]);
      const [productData, orderData, reviewData, settingsData] = await Promise.all([
        productResponse.json(),
        orderResponse.json(),
        reviewResponse.json(),
        settingsResponse.json(),
      ]);
      for (const [response, data] of [
        [productResponse, productData],
        [orderResponse, orderData],
        [reviewResponse, reviewData],
        [settingsResponse, settingsData],
      ] as const) {
        if (!response.ok) throw new Error(data.message || 'دریافت اطلاعات فروشگاه ناموفق بود');
      }
      setProducts((productData.products as ShopProductRecord[]).map((product) => ({
        ...product,
        images: product.images.join('\n'),
        price: String(product.price),
        salePrice: product.salePrice == null ? '' : String(product.salePrice),
        saleStartsAt: toDateInput(product.saleStartsAt),
        saleEndsAt: toDateInput(product.saleEndsAt),
        availableAt: toDateInput(product.availableAt),
        variants: product.variants.map((variant) => ({
          ...variant,
          stock: String(variant.stock),
          priceOverride: variant.priceOverride == null ? '' : String(variant.priceOverride),
          size: variant.size ?? '',
          color: variant.color ?? '',
        })),
      })));
      setOrders(orderData.orders);
      setReviews(reviewData.reviews);
      setShippingFee(String(settingsData.settings.shippingFee));
    } catch (loadError) {
      console.error('Shop management data load failed:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'دریافت اطلاعات فروشگاه ناموفق بود');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Loading starts with the spinner visible; the data setters run only after the fetches resolve.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAll();
  }, [loadAll]);

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const payload = {
      ...form,
      images: form.images.split(/\r?\n/).map((url) => url.trim()).filter(Boolean),
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      saleStartsAt: dateInputToIranBoundary(form.saleStartsAt),
      saleEndsAt: dateInputToIranBoundary(form.saleEndsAt, true),
      availableAt: dateInputToIranBoundary(form.availableAt),
      shortDescription: form.shortDescription || null,
      variants: form.variants.map((variant) => ({
        ...variant,
        size: variant.size || null,
        color: variant.color || null,
        priceOverride: variant.priceOverride ? Number(variant.priceOverride) : null,
        stock: Number(variant.stock),
      })),
    };
    try {
      const response = await fetch(
        form.id ? `/api/admin/shop/products/${form.id}` : '/api/admin/shop/products',
        {
          method: form.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'ذخیره محصول ناموفق بود');
      toast.success('محصول ذخیره شد');
      setForm(newProduct());
      await loadAll();
    } catch (saveError) {
      console.error('Shop product save failed:', saveError);
      const message = saveError instanceof Error ? saveError.message : 'ذخیره محصول ناموفق بود';
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const editProduct = (product: ManagedProduct) => {
    setForm({ ...product });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deactivateProduct = async (id: string) => {
    if (!window.confirm('این محصول از فروشگاه پنهان شود؟ سفارش‌های قبلی حفظ می‌شوند.')) return;
    try {
      const response = await fetch(`/api/admin/shop/products/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'غیرفعال‌سازی ناموفق بود');
      toast.success(data.message);
      await loadAll();
    } catch (deactivateError) {
      toast.error(deactivateError instanceof Error ? deactivateError.message : 'غیرفعال‌سازی ناموفق بود');
    }
  };

  const changeOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/shop/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'تغییر وضعیت ناموفق بود');
      toast.success(data.message);
      await loadAll();
    } catch (statusError) {
      toast.error(statusError instanceof Error ? statusError.message : 'تغییر وضعیت ناموفق بود');
    }
  };

  const moderateReview = async (review: ShopReview, isPublished: boolean) => {
    try {
      const response = await fetch('/api/admin/shop/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: review.id, isPublished }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'تغییر دیدگاه ناموفق بود');
      toast.success(data.message);
      await loadAll();
    } catch (moderationError) {
      toast.error(moderationError instanceof Error ? moderationError.message : 'تغییر دیدگاه ناموفق بود');
    }
  };

  const saveShipping = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch('/api/admin/shop/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingFee: Number(shippingFee) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'ذخیره تنظیمات ناموفق بود');
      toast.success('هزینه ارسال ذخیره شد');
      setShippingFee(String(data.settings.shippingFee));
    } catch (settingsError) {
      toast.error(settingsError instanceof Error ? settingsError.message : 'ذخیره تنظیمات ناموفق بود');
    } finally {
      setBusy(false);
    }
  };

  const updateVariant = (index: number, values: Partial<ShopVariantForm>) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...values } : variant,
      ),
    }));
  };

  const changeText = (key: keyof ShopProductForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
  const refreshData = () => {
    setLoading(true);
    setError('');
    void loadAll();
  };

  return (
    <AdminLayout title="مدیریت فروشگاه">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {([
            ['products', 'محصولات و موجودی'],
            ['orders', 'سفارش‌ها'],
            ['reviews', 'دیدگاه‌ها'],
            ['settings', 'هزینه ارسال'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSection(key)}
              aria-pressed={section === key}
              className={`rounded-lg px-4 py-2 font-semibold ${section === key ? 'bg-primary-700 text-white' : 'bg-white text-slate-700'}`}
            >
              {label}
            </button>
          ))}
          <button type="button" onClick={refreshData} className="mr-auto text-sm text-primary-700 underline">
            تازه‌سازی اطلاعات
          </button>
        </div>
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-4 text-rose-800">{error}</p>}
        {loading ? (
          <p role="status" className="py-10 text-center">در حال بارگذاری مدیریت فروشگاه...</p>
        ) : section === 'products' ? (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <section className="space-y-3" aria-label="فهرست محصولات">
              {products.map((product) => (
                <article key={product.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-slate-900">{product.name}</h2>
                      <p className="text-sm text-slate-600">{product.category} · {formatToman(Number(product.price))}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {product.isActive ? 'فعال' : 'پنهان'} · {product.isComingSoon ? 'به‌زودی' : 'آماده فروش'} · {product.variants.length} گزینه
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => editProduct(product)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">ویرایش</button>
                      {product.isActive && <button type="button" onClick={() => void deactivateProduct(product.id)} className="rounded-lg border border-rose-300 px-3 py-2 text-sm text-rose-700">پنهان‌کردن</button>}
                    </div>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                    {product.variants.map((variant) => (
                      <li key={variant.sku} className="rounded bg-slate-100 px-2 py-1">
                        {variant.sku} · {variant.size || 'بدون سایز'} · موجودی {variant.stock}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
              {products.length === 0 && <p className="rounded-xl bg-white p-6 text-slate-600">هنوز محصولی ثبت نشده است.</p>}
            </section>

            <form onSubmit={saveProduct} className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">{form.id ? 'ویرایش محصول' : 'افزودن محصول'}</h2>
              <label className="block"><span className="mb-1 block font-semibold">نام محصول</span><input required minLength={2} value={form.name} onChange={(event) => changeText('name', event.target.value)} className="w-full rounded-lg border px-3 py-2" /></label>
              <label className="block"><span className="mb-1 block font-semibold">نشانی لاتین (slug)</span><input required value={form.slug} onChange={(event) => changeText('slug', event.target.value)} className="w-full rounded-lg border px-3 py-2" /></label>
              <label className="block"><span className="mb-1 block font-semibold">دسته‌بندی</span><input required value={form.category} onChange={(event) => changeText('category', event.target.value)} className="w-full rounded-lg border px-3 py-2" placeholder="کفش، لباس، توپ..." /></label>
              <label className="block"><span className="mb-1 block font-semibold">معرفی کوتاه</span><input value={form.shortDescription} onChange={(event) => changeText('shortDescription', event.target.value)} className="w-full rounded-lg border px-3 py-2" /></label>
              <label className="block"><span className="mb-1 block font-semibold">توضیحات کامل</span><textarea required rows={4} value={form.description} onChange={(event) => changeText('description', event.target.value)} className="w-full rounded-lg border px-3 py-2" /></label>
              <label className="block"><span className="mb-1 block font-semibold">پیوند تصاویر (هر پیوند در یک خط)</span><textarea rows={3} value={form.images} onChange={(event) => changeText('images', event.target.value)} className="w-full rounded-lg border px-3 py-2" /></label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className="mb-1 block font-semibold">قیمت (تومان)</span><input required type="number" min={1} value={form.price} onChange={(event) => changeText('price', event.target.value)} className="w-full rounded-lg border px-3 py-2" /></label>
                <label className="block"><span className="mb-1 block font-semibold">قیمت تخفیفی (اختیاری)</span><input type="number" min={1} value={form.salePrice} onChange={(event) => changeText('salePrice', event.target.value)} className="w-full rounded-lg border px-3 py-2" /></label>
                <label className="block"><span className="mb-1 block font-semibold">شروع تخفیف (اختیاری)</span><input type="date" value={form.saleStartsAt} onChange={(event) => changeText('saleStartsAt', event.target.value)} className="w-full rounded-lg border px-3 py-2" /></label>
                <label className="block"><span className="mb-1 block font-semibold">پایان تخفیف (اختیاری)</span><input type="date" value={form.saleEndsAt} onChange={(event) => changeText('saleEndsAt', event.target.value)} className="w-full rounded-lg border px-3 py-2" /></label>
                <label className="block"><span className="mb-1 block font-semibold">تاریخ عرضه (اختیاری)</span><input type="date" value={form.availableAt} onChange={(event) => changeText('availableAt', event.target.value)} className="w-full rounded-lg border px-3 py-2" /></label>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /> نمایش در فروشگاه</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.isComingSoon} onChange={(event) => setForm({ ...form, isComingSoon: event.target.checked })} /> عرضه به‌زودی</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> تبلیغ در خانه</label>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><h3 className="font-bold">سایز، رنگ و موجودی</h3><button type="button" onClick={() => setForm({ ...form, variants: [...form.variants, { sku: '', size: '', color: '', priceOverride: '', stock: '0', isActive: true }] })} className="text-sm font-semibold text-primary-700 underline">افزودن گزینه</button></div>
                {form.variants.map((variant, index) => (
                  <div key={`${variant.sku}-${index}`} className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-3">
                    <label className="text-xs">SKU<input required value={variant.sku} onChange={(event) => updateVariant(index, { sku: event.target.value })} className="mt-1 w-full rounded border px-2 py-2 text-sm" /></label>
                    <label className="text-xs">سایز<input value={variant.size} onChange={(event) => updateVariant(index, { size: event.target.value })} className="mt-1 w-full rounded border px-2 py-2 text-sm" /></label>
                    <label className="text-xs">رنگ<input value={variant.color} onChange={(event) => updateVariant(index, { color: event.target.value })} className="mt-1 w-full rounded border px-2 py-2 text-sm" /></label>
                    <label className="text-xs">قیمت جداگانه<input type="number" min={1} value={variant.priceOverride} onChange={(event) => updateVariant(index, { priceOverride: event.target.value })} className="mt-1 w-full rounded border px-2 py-2 text-sm" /></label>
                    <label className="text-xs">موجودی<input required type="number" min={0} value={variant.stock} onChange={(event) => updateVariant(index, { stock: event.target.value })} className="mt-1 w-full rounded border px-2 py-2 text-sm" /></label>
                    <div className="flex items-end justify-between gap-2"><label className="flex items-center gap-1 pb-2 text-xs"><input type="checkbox" checked={variant.isActive} onChange={(event) => updateVariant(index, { isActive: event.target.checked })} /> فعال</label>{form.variants.length > 1 && <button type="button" onClick={() => setForm({ ...form, variants: form.variants.filter((_, variantIndex) => variantIndex !== index) })} className="pb-2 text-xs text-rose-700 underline">حذف گزینه</button>}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button disabled={busy} type="submit" className="btn btn-primary flex-1 px-5 py-3 disabled:opacity-50">{busy ? 'در حال ذخیره...' : 'ذخیره محصول'}</button>
                {form.id && <button type="button" onClick={() => setForm(newProduct())} className="btn btn-outline px-4 py-3">لغو ویرایش</button>}
              </div>
            </form>
          </div>
        ) : section === 'orders' ? (
          <section className="space-y-4" aria-label="سفارش‌ها">
            {orders.map((order) => {
              const nextStatus = order.status === 'PAID' ? 'PROCESSING' : order.status === 'PROCESSING' ? 'SHIPPED' : order.status === 'SHIPPED' ? 'DELIVERED' : null;
              return (
                <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div><h2 className="font-bold">سفارش {order.orderNumber}</h2><p className="text-sm text-slate-600">{order.fullName} · {order.phone}</p><p className="text-sm text-slate-600">{order.province ? `${order.province}، ` : ''}{order.city} · کد پستی {order.postalCode}</p><p className="text-sm text-slate-600">{order.address}</p></div>
                    <div className="text-left"><p className="font-bold">{formatToman(order.totalAmount)}</p><p className="text-sm">{orderStatusLabels[order.status] ?? order.status}</p><p className="text-xs text-slate-500">{formatPersianDate(order.createdAt)}</p></div>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-2 text-sm">{order.items.map((item) => <li key={item.id} className="rounded bg-slate-100 px-3 py-1">{item.productName} ({item.sku}) × {item.quantity}</li>)}</ul>
                  {nextStatus && <button type="button" onClick={() => void changeOrderStatus(order.id, nextStatus)} className="mt-4 rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white">{nextStatus === 'PROCESSING' ? 'شروع آماده‌سازی' : nextStatus === 'SHIPPED' ? 'ثبت ارسال' : 'ثبت تحویل'}</button>}
                </article>
              );
            })}
            {orders.length === 0 && <p className="rounded-xl bg-white p-6">هنوز سفارشی ثبت نشده است.</p>}
          </section>
        ) : section === 'reviews' ? (
          <section className="space-y-4" aria-label="مدیریت دیدگاه‌ها">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap justify-between gap-2"><div><h2 className="font-bold">{review.product.name} · {review.user.firstName} {review.user.lastName}</h2><p className="text-amber-600">{'★'.repeat(review.rating)}</p></div><p className="text-sm text-slate-500">{formatPersianDate(review.createdAt)}</p></div>
                <p className="mt-3 whitespace-pre-wrap">{review.body}</p>
                {review.mediaUrls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm text-primary-700 underline">{url}</a>)}
                <button type="button" onClick={() => void moderateReview(review, !review.isPublished)} className={`mt-4 rounded-lg px-4 py-2 text-sm font-semibold ${review.isPublished ? 'border border-rose-300 text-rose-700' : 'bg-emerald-700 text-white'}`}>
                  {review.isPublished ? 'پنهان‌کردن دیدگاه' : 'تأیید و انتشار'}
                </button>
              </article>
            ))}
            {reviews.length === 0 && <p className="rounded-xl bg-white p-6">دیدگاهی برای بررسی وجود ندارد.</p>}
          </section>
        ) : (
          <form onSubmit={saveShipping} className="max-w-xl space-y-4 rounded-xl bg-white p-6">
            <h2 className="text-xl font-bold">تنظیم هزینه ارسال</h2>
            <label className="block"><span className="mb-1 block">هزینه ارسال به تومان (صفر برای ارسال رایگان)</span><input required type="number" min={0} max={100000000} value={shippingFee} onChange={(event) => setShippingFee(event.target.value)} className="w-full rounded-lg border px-3 py-3" /></label>
            <p className="text-sm text-slate-600">هزینه فعلی: {formatToman(Number(shippingFee) || 0)}</p>
            <button disabled={busy} type="submit" className="btn btn-primary px-5 py-3 disabled:opacity-50">ذخیره هزینه ارسال</button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
