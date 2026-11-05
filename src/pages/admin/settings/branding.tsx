import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function BrandingSettingsPage() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    void fetch('/api/admin/settings/branding')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'دریافت لوگو ناموفق بود');
        if (active) setLogoUrl(data.logoUrl ?? null);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'دریافت لوگو ناموفق بود');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const uploadLogo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const uploadResponse = await fetch('/api/uploads?scope=site-logo', {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || 'بارگذاری لوگو ناموفق بود');
      }

      const saveResponse = await fetch('/api/admin/settings/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: uploadData.url }),
      });
      const saveData = await saveResponse.json();
      if (!saveResponse.ok) {
        throw new Error(saveData.message || 'ثبت لوگو ناموفق بود');
      }
      setLogoUrl(saveData.logoUrl ?? null);
      setMessage('لوگوی جدید ذخیره شد.');
      event.target.value = '';
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'بارگذاری لوگو ناموفق بود');
    } finally {
      setBusy(false);
    }
  };

  const removeLogo = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/admin/settings/branding', {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'حذف لوگو ناموفق بود');
      setLogoUrl(data.logoUrl ?? null);
      setMessage('لوگو حذف شد و نشان پیش‌فرض نمایش داده می‌شود.');
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'حذف لوگو ناموفق بود');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title="تنظیمات برند">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900">لوگوی سایت</h1>
          <p className="max-w-prose leading-7 text-slate-600">
            لوگو در سربرگ و پابرگ سایت نمایش داده می‌شود. در صورت حذف، نشان AP جایگزین خواهد شد.
          </p>
        </header>

        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
            {message}
          </p>
        )}

        <section
          aria-label="مدیریت لوگو"
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
            {loading ? (
              <p role="status" className="text-slate-600">در حال بارگذاری لوگو…</p>
            ) : logoUrl ? (
              <Image
                src={logoUrl}
                alt="پیش‌نمایش لوگوی فعلی آکادمی"
                width={256}
                height={160}
                className="max-h-40 w-auto object-contain"
              />
            ) : (
              <span className="flex size-20 items-center justify-center rounded-xl bg-red-700 text-2xl font-extrabold text-white shadow-md">
                AP
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="branding-logo" className="block font-semibold text-slate-900">
              انتخاب لوگوی JPEG، PNG یا WebP
            </label>
            <p id="branding-logo-help" className="text-sm leading-6 text-slate-600">
              سقف حجم تصویر ۴ مگابایت در ورسل و ۵ مگابایت در سایر سرورها است.
            </p>
            <input
              id="branding-logo"
              name="logo"
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              aria-describedby="branding-logo-help"
              disabled={busy || loading}
              onChange={(event) => void uploadLogo(event)}
              className="min-h-11 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-800 file:ml-3 file:min-h-9 file:rounded-md file:border-0 file:bg-red-50 file:px-3 file:font-semibold file:text-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-wait disabled:opacity-60"
            />
          </div>

          {logoUrl && (
            <button
              type="button"
              onClick={() => void removeLogo()}
              disabled={busy}
              className="min-h-11 rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-800 underline-offset-4 hover:bg-red-50 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-wait disabled:opacity-60"
            >
              {busy ? 'در حال ذخیره…' : 'حذف لوگوی فعلی'}
            </button>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
