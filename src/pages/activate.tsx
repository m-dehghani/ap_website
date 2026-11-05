import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

type Channel = 'email' | 'phone';

const ActivatePage: React.FC = () => {
  const router = useRouter();
  const [challengeId, setChallengeId] = useState('');
  const [mode, setMode] = useState<'request' | 'verify' | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [channel, setChannel] = useState<Channel>('phone');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activated, setActivated] = useState(false);

  const routeChallengeId =
    router.isReady && typeof router.query.challengeId === 'string'
      ? router.query.challengeId
      : '';
  const activeChallengeId = challengeId || routeChallengeId;
  const currentMode = mode ?? (routeChallengeId ? 'verify' : 'request');

  const requestCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      const response = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          identifier,
          password,
          channel,
        }),
      });
      const result = await response.json();
      setMessage(result.message ?? 'درخواست انجام نشد؛ دوباره تلاش کنید.');
      if (typeof result.challengeId === 'string') {
        setChallengeId(result.challengeId);
      }
      if (response.ok && result.activationSent) {
        setPassword('');
        setCode('');
        setMode('verify');
      } else {
        setMode('request');
      }
    } catch {
      setMessage('ارتباط با سرور برقرار نشد؛ دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      const response = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          challengeId: activeChallengeId,
          code,
        }),
      });
      const result = await response.json();
      setMessage(result.message ?? 'کد تأیید نشد؛ دوباره تلاش کنید.');
      const completed = response.ok && result.activated === true;
      setActivated(completed);
      if (completed) {
        try {
          if (
            window.sessionStorage.getItem('registration-confirmation-proof')
          ) {
            void router.push('/registration-success');
          }
        } catch {
          // A verified account can still proceed to login without browser storage.
        }
      }
    } catch {
      setMessage('ارتباط با سرور برقرار نشد؛ دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout
      title="فعال‌سازی حساب - آکادمی فوتبال افشین پیروانی"
      description="فعال‌سازی حساب کاربری با تأیید ایمیل یا شماره تلفن ثبت‌شده."
      noindex
    >
      <main className="mx-auto my-12 max-w-xl rounded-lg bg-white p-6 shadow-lg sm:p-8">
        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          فعال‌سازی حساب کاربری
        </h1>
        <p className="mb-6 text-gray-700">
          برای دسترسی به حساب، ایمیل یا شماره تلفن ثبت‌شده را تأیید کنید.
        </p>

        {message ? (
          <p
            role="status"
            className="mb-5 rounded-lg bg-blue-50 p-3 text-sm text-blue-900"
          >
            {message}
          </p>
        ) : null}

        {activated ? (
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center rounded-lg bg-primary-700 px-5 py-3 font-semibold text-white hover:bg-primary-800"
          >
            ورود به حساب کاربری
          </Link>
        ) : currentMode === 'verify' ? (
          <form onSubmit={verifyCode} className="space-y-5">
            <div>
              <label
                htmlFor="activation-code"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                کد شش‌رقمی فعال‌سازی
              </label>
              <input
                id="activation-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9۰-۹٠-٩]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !activeChallengeId}
              className="min-h-11 w-full rounded-lg bg-primary-700 px-5 py-3 font-semibold text-white hover:bg-primary-800 disabled:opacity-50"
            >
              {isSubmitting ? 'در حال بررسی…' : 'تأیید کد و فعال‌سازی'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('request');
                setMessage('');
              }}
              className="w-full rounded-lg px-4 py-2 font-medium text-primary-700 underline"
            >
              ارسال دوباره کد با رمز عبور
            </button>
          </form>
        ) : (
          <form onSubmit={requestCode} className="space-y-5">
            <div>
              <label
                htmlFor="activation-identifier"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                ایمیل یا شماره تلفن ثبت‌شده
              </label>
              <input
                id="activation-identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
                dir="auto"
              />
            </div>
            <div>
              <label
                htmlFor="activation-password"
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                رمز عبور حساب
              </label>
              <input
                id="activation-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-gray-800">
                روش دریافت کد
              </legend>
              <div className="flex flex-wrap gap-5">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="activation-channel"
                    value="phone"
                    checked={channel === 'phone'}
                    onChange={() => setChannel('phone')}
                  />
                  پیامک به شماره ثبت‌شده
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="activation-channel"
                    value="email"
                    checked={channel === 'email'}
                    onChange={() => setChannel('email')}
                  />
                  ایمیل ثبت‌شده
                </label>
              </div>
            </fieldset>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-11 w-full rounded-lg bg-primary-700 px-5 py-3 font-semibold text-white hover:bg-primary-800 disabled:opacity-50"
            >
              {isSubmitting ? 'در حال ارسال…' : 'ارسال کد فعال‌سازی'}
            </button>
          </form>
        )}

        {!activated ? (
          <p className="mt-6 text-center text-sm text-gray-600">
            <Link href="/login" className="text-primary-700 underline">
              بازگشت به ورود
            </Link>
          </p>
        ) : null}
      </main>
    </Layout>
  );
};

export default ActivatePage;
