import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { SunIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';
import ThemePreferenceControl from '@/components/ui/ThemePreferenceControl';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) void router.replace('/login');
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <Layout title="تنظیمات">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-700"
            role="status"
            aria-label="در حال بارگذاری"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="تنظیمات حساب کاربری">
      <div className="container-custom py-12 md:py-16">
        <header className="mb-8">
          <p className="text-sm font-semibold text-primary-700">حساب کاربری</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
            تنظیمات
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            ظاهر سایت را مطابق سلیقه‌تان تنظیم کنید؛ انتخاب شما در بازدیدهای بعدی
            هم حفظ می‌شود.
          </p>
        </header>

        <section
          aria-labelledby="appearance-title"
          className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="mb-5 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
              <SunIcon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 id="appearance-title" className="text-xl font-bold text-slate-900">
                ظاهر و پوسته
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                روز، شب یا پیروی از تنظیمات نمایشگر دستگاه را انتخاب کنید.
              </p>
            </div>
          </div>
          <ThemePreferenceControl />
        </section>
      </div>
    </Layout>
  );
}
