import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const CONFIRMATION_PROOF_KEY = 'registration-confirmation-proof';

const RegistrationSuccessPage: React.FC = () => {
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      let proof: string | null = null;
      try {
        proof = window.sessionStorage.getItem(CONFIRMATION_PROOF_KEY);
      } catch {
        proof = null;
      }

      if (!proof) {
        if (active) setChecking(false);
        return;
      }

      try {
        const response = await fetch('/api/register/confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proof }),
        });
        const result = (await response.json()) as { verified?: boolean };
        if (!active) return;
        if (response.ok && result.verified === true) {
          setVerified(true);
          try {
            window.sessionStorage.removeItem(CONFIRMATION_PROOF_KEY);
          } catch {
            // Storage is optional; the server-verified result remains valid.
          }
        }
      } catch {
        // The recovery state remains neutral when the verifier is unavailable.
      } finally {
        if (active) setChecking(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Layout
      title={
        verified
          ? 'ثبت‌نام موفق - آکادمی فوتبال افشین پیروانی'
          : 'پیگیری ثبت‌نام - آکادمی فوتبال افشین پیروانی'
      }
      description="وضعیت ثبت‌نام شما در آکادمی فوتبال افشین پیروانی."
      noindex
    >
      <section className="mx-auto my-12 max-w-3xl overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="bg-linear-to-r from-accent-700 to-accent-800 px-8 py-12 text-center">
          {verified ? (
            <CheckCircleIcon className="mx-auto mb-4 h-16 w-16 text-white" />
          ) : (
            <InformationCircleIcon className="mx-auto mb-4 h-16 w-16 text-white" />
          )}
          <h1 className="mb-2 text-3xl font-bold text-white">
            {checking
              ? 'در حال بررسی ثبت‌نام'
              : verified
                ? 'ثبت‌نام شما تأیید شد'
                : 'وضعیت ثبت‌نام قابل تأیید نیست'}
          </h1>
          <p className="text-lg text-green-100">
            {checking
              ? 'لطفاً چند لحظه صبر کنید.'
              : verified
                ? 'ثبت‌نام شما در آکادمی ثبت شده است.'
                : 'برای پیگیری، به فعال‌سازی حساب یا برنامه‌های آموزشی مراجعه کنید.'}
          </p>
        </div>

        <div className="space-y-6 p-8 text-center">
          {verified ? (
            <p className="text-gray-700">
              برای ورود و مشاهده وضعیت ثبت‌نام، ابتدا حساب کاربری خود را فعال
              کنید.
            </p>
          ) : null}
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={verified ? '/activate' : '/programs'}
              className="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
            >
              {verified ? 'فعال‌سازی حساب' : 'مشاهده برنامه‌ها'}
            </Link>
            <Link
              href="/contact"
              className="rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-800 hover:bg-gray-200"
            >
              تماس با آکادمی
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RegistrationSuccessPage;
