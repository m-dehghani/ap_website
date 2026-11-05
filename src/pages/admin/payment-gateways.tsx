import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { NextSeo } from 'next-seo';
import AdminLayout from '@/components/AdminLayout';
import type {
  AdminGatewayProvider,
  AdminGatewaySettings,
} from '@/lib/payment-gateways';

type EditableProvider = 'ZARINPAL' | 'ZIBAL';
type GatewayForm = {
  enabled: boolean;
  isDefault: boolean;
  credential: string;
  clearCredential: boolean;
};

const providerLabels: Record<EditableProvider, string> = {
  ZARINPAL: 'زرین‌پال',
  ZIBAL: 'زیبال',
};

function toForm(provider: AdminGatewayProvider): GatewayForm {
  return {
    enabled: provider.enabled,
    isDefault: provider.isDefault,
    credential: '',
    clearCredential: false,
  };
}

export default function PaymentGatewaysPage() {
  const [settings, setSettings] = useState<AdminGatewaySettings | null>(null);
  const [forms, setForms] = useState<Record<EditableProvider, GatewayForm>>({
    ZARINPAL: {
      enabled: false,
      isDefault: false,
      credential: '',
      clearCredential: false,
    },
    ZIBAL: {
      enabled: false,
      isDefault: false,
      credential: '',
      clearCredential: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<EditableProvider | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/admin/payment-gateways')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'خطا در دریافت تنظیمات');
        }
        return result as AdminGatewaySettings;
      })
      .then((next) => {
        if (!active) return;
        setSettings(next);
        setForms({
          ZARINPAL: toForm(
            next.providers.find((provider) => provider.provider === 'ZARINPAL')!,
          ),
          ZIBAL: toForm(
            next.providers.find((provider) => provider.provider === 'ZIBAL')!,
          ),
        });
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setError(
          caught instanceof Error
            ? caught.message
            : 'خطا در دریافت تنظیمات درگاه',
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function updateForm(
    provider: EditableProvider,
    changes: Partial<GatewayForm>,
  ) {
    setForms((current) => ({
      ...current,
      [provider]: { ...current[provider], ...changes },
    }));
    setNotice('');
  }

  async function save(provider: EditableProvider, event: FormEvent) {
    event.preventDefault();
    const form = forms[provider];
    setSaving(provider);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/payment-gateways', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          enabled: form.enabled,
          isDefault: form.isDefault,
          ...(form.credential ? { credential: form.credential } : {}),
          ...(form.clearCredential ? { clearCredential: true } : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'ذخیره تنظیمات ناموفق بود');
      setSettings(result as AdminGatewaySettings);
      setForms({
        ZARINPAL: toForm(
          result.providers.find(
            (item: AdminGatewayProvider) => item.provider === 'ZARINPAL',
          ),
        ),
        ZIBAL: toForm(
          result.providers.find(
            (item: AdminGatewayProvider) => item.provider === 'ZIBAL',
          ),
        ),
      });
      setNotice('تنظیمات درگاه ذخیره شد.');
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'ذخیره تنظیمات ناموفق بود',
      );
    } finally {
      setSaving(null);
    }
  }

  const providerState = (provider: EditableProvider) =>
    settings?.providers.find((item) => item.provider === provider);

  return (
    <AdminLayout title="تنظیمات درگاه پرداخت">
      <NextSeo title="تنظیمات درگاه پرداخت" noindex nofollow />
      <div className="mx-auto max-w-4xl space-y-6" dir="rtl">
        <header className="rounded-2xl bg-slate-950 p-7 text-white shadow-lg">
          <p className="text-sm font-semibold text-emerald-300">
            پرداخت و تسویه
          </p>
          <h1 className="mt-2 text-3xl font-bold">درگاه‌های پرداخت</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            اطلاعات پذیرنده به‌صورت رمزگذاری‌شده نگهداری می‌شود و پس از ذخیره
            دوباره نمایش داده نخواهد شد.
          </p>
        </header>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="rounded-xl bg-emerald-50 p-4 text-emerald-800"
          >
            {notice}
          </p>
        )}
        {settings && !settings.keyReady && (
          <p role="alert" className="rounded-xl bg-amber-50 p-4 text-amber-900">
            برای ذخیره امن کلیدها، متغیر PAYMENT_CONFIG_ENCRYPTION_KEY باید در
            محیط سرور تنظیم شود. تا آن زمان تغییر تنظیمات غیرفعال است.
          </p>
        )}
        {loading && (
          <p role="status" className="py-4 text-slate-600">
            در حال دریافت تنظیمات درگاه...
          </p>
        )}

        {(['ZARINPAL', 'ZIBAL'] as const).map((provider) => {
          const current = providerState(provider);
          const form = forms[provider];
          const label = providerLabels[provider];
          return (
            <form
              key={provider}
              onSubmit={(event) => void save(provider, event)}
              className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              aria-label={`تنظیمات درگاه ${label}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{label}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {current?.configured
                      ? 'اطلاعات پذیرنده ذخیره شده است.'
                      : 'برای فعال‌سازی، کلید پذیرنده را وارد کنید.'}
                  </p>
                </div>
                {current?.isDefault && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                    درگاه پیش‌فرض
                  </span>
                )}
              </div>

              <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  disabled={
                    loading || !settings?.keyReady || saving !== null
                  }
                  onChange={(event) =>
                    updateForm(provider, { enabled: event.target.checked })
                  }
                  aria-label={`فعال‌سازی درگاه ${label}`}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                />
                فعال‌سازی برای پرداخت‌های جدید
              </label>

              <label className="block text-sm font-semibold text-slate-800">
                کلید پذیرنده
                <input
                  type="password"
                  autoComplete="new-password"
                  value={form.credential}
                  disabled={
                    loading ||
                    !settings?.keyReady ||
                    saving !== null ||
                    form.clearCredential
                  }
                  onChange={(event) =>
                    updateForm(provider, {
                      credential: event.target.value,
                      clearCredential: false,
                    })
                  }
                  placeholder={
                    current?.configured
                      ? 'برای جایگزینی، کلید جدید را وارد کنید'
                      : 'کلید پذیرنده'
                  }
                  className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 font-normal focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              {provider === 'ZIBAL' && (
                <p className="text-sm leading-6 text-slate-600">
                  مبلغ پرداخت به زیبال بر حسب ریال ارسال می‌شود.
                </p>
              )}

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  disabled={
                    loading ||
                    !settings?.keyReady ||
                    saving !== null ||
                    !form.enabled
                  }
                  onChange={(event) =>
                    updateForm(provider, { isDefault: event.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                />
                استفاده به‌عنوان درگاه پیش‌فرض
              </label>

              {current?.credentialSource === 'stored' && (
                <label className="flex items-center gap-3 text-sm text-red-800">
                  <input
                    type="checkbox"
                    checked={form.clearCredential}
                    disabled={
                      loading ||
                      !settings?.keyReady ||
                      saving !== null ||
                      form.enabled ||
                      form.isDefault
                    }
                    onChange={(event) =>
                      updateForm(provider, {
                        clearCredential: event.target.checked,
                        credential: '',
                      })
                    }
                    className="h-4 w-4 rounded border-red-300 text-red-700 focus:ring-red-600"
                  />
                  حذف کلید ذخیره‌شده پس از پایان بازه دریافت پاسخ درگاه برای تراکنش‌های اخیر
                </label>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  !settings?.keyReady ||
                  saving !== null ||
                  !current
                }
                className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving === provider
                  ? 'در حال ذخیره...'
                  : `ذخیره تنظیمات ${label}`}
              </button>
            </form>
          );
        })}

        <section
          aria-label="درگاه پاسارگاد"
          className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-700">پاسارگاد</h2>
              <p className="mt-2 leading-7 text-slate-600">
                در انتظار تأیید مستندات رسمی و قرارداد دقیق محصول. این درگاه
                غیرفعال است و برای پرداخت در دسترس نیست.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-600">
              تعویق‌شده
            </span>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
