import React, { FormEvent, useEffect, useState } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { calculateAge, parseBirthDate, parsePersianBirthDate } from '@/lib/age';
import { formatPersianDate, formatToman, toPersianDigits } from '@/lib/format';
import PersianDatePicker from '@/components/PersianDatePicker';
import type {
  StudentDashboardViewModel,
  StudentProfileFormValues,
  StudentRegistrationProfileFormValues,
} from '@/types/viewModels/student';

const activeStatuses = new Set(['PENDING', 'APPROVED']);

const registrationStatus: Record<string, string> = {
  PENDING: 'در انتظار تأیید',
  APPROVED: 'تأیید شده',
  CANCELLED: 'لغو شده',
  COMPLETED: 'تکمیل شده',
};

const StudentDashboardPage: React.FC<StudentDashboardViewModel> = ({
  student,
  programs,
}) => {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [savedBirthDate, setSavedBirthDate] = useState(student.birthDate);
  const [profile, setProfile] = useState<StudentProfileFormValues>({
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email ?? '',
    phone: student.phone ?? '',
    birthDate: formatPersianDate(student.birthDate),
    marketingOptIn: student.marketingOptIn,
  });
  const [currentContact, setCurrentContact] = useState({
    email: student.email ?? '',
    phone: student.phone ?? '',
  });
  const [registrationProfiles, setRegistrationProfiles] = useState<
    Record<string, StudentRegistrationProfileFormValues>
  >(() =>
    Object.fromEntries(
      student.registrations.map((registration) => [
        registration.id,
        {
          experienceLevel: registration.experienceLevel ?? '',
          parentName: registration.parentName ?? '',
          parentEmail: registration.parentEmail ?? '',
          emergencyContactName: registration.emergencyContactName ?? '',
          emergencyContactPhone: registration.emergencyContactPhone ?? '',
          medicalConditions: registration.medicalConditions ?? '',
        },
      ]),
    ),
  );
  const [verificationCodes, setVerificationCodes] = useState({
    email: '',
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    channel: student.email ? 'email' : 'phone',
    password: '',
    confirmPassword: '',
    code: '',
    codeRequested: false,
  });
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'STUDENT')) {
      void router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'STUDENT') {
    return (
      <Layout title="در حال بارگذاری...">
        <div className="min-h-screen flex items-center justify-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
            role="status"
            aria-label="در حال بارگذاری"
          />
        </div>
      </Layout>
    );
  }

  const activeRegistrations = student.registrations.filter((registration) =>
    activeStatuses.has(registration.status),
  );
  const totalDue = student.registrations
    .filter((registration) => registration.status !== 'CANCELLED')
    .reduce(
      (amount, registration) =>
        amount +
        Math.max(registration.totalAmount - registration.paidAmount, 0),
      0,
    );
  const enrolledProgramIds = new Set(
    activeRegistrations.map((registration) => registration.program.id),
  );
  const savedBirthDateValue = savedBirthDate
    ? parseBirthDate(savedBirthDate.slice(0, 10))
    : null;
  const studentAge = savedBirthDateValue
    ? calculateAge(savedBirthDateValue)
    : null;
  const availablePrograms =
    studentAge === null
      ? []
      : programs.filter(
          (program) =>
            studentAge >= program.minAge &&
            studentAge <= program.maxAge &&
            !enrolledProgramIds.has(program.id),
        );
  const paymentOutcome =
    typeof router.query.payment === 'string' ? router.query.payment : '';
  const paymentMessage =
    paymentOutcome === 'success'
      ? 'پرداخت با موفقیت تأیید شد.'
      : paymentOutcome === 'cancelled'
        ? 'پرداخت لغو شد و مبلغی از حساب شما کسر نشده است.'
        : '';
  const paymentError =
    paymentOutcome === 'refund-required'
      ? 'پرداخت دریافت شد اما به ثبت‌نام لغوشده مربوط است؛ برای پیگیری بازپرداخت با آکادمی تماس بگیرید.'
      : paymentOutcome && !['success', 'cancelled'].includes(paymentOutcome)
        ? 'تأیید پرداخت انجام نشد. وضعیت پرداخت را از پنل بررسی کنید یا با آکادمی تماس بگیرید.'
        : '';

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    const birthDateText = profile.birthDate.trim();
    const birthDate = birthDateText
      ? parsePersianBirthDate(birthDateText)
      : null;
    if (birthDateText && !birthDate) {
      setError('تاریخ تولد را به‌صورت شمسی و معتبر وارد کنید.');
      return;
    }

    setBusyAction('profile');
    try {
      const response = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          birthDate: birthDate?.toISOString().slice(0, 10) ?? '',
          marketingOptIn: profile.marketingOptIn,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || 'ذخیره پروفایل ناموفق بود');
      setSavedBirthDate(result.user.birthDate);
      setProfile({
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email ?? '',
        phone: result.user.phone ?? '',
        birthDate: formatPersianDate(result.user.birthDate),
        marketingOptIn: result.user.marketingOptIn,
      });
      await refreshUser();
      setMessage('اطلاعات پروفایل ذخیره شد.');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'ذخیره پروفایل ناموفق بود',
      );
    } finally {
      setBusyAction(null);
    }
  };

  const handleRegistrationProfileSubmit = async (
    event: FormEvent<HTMLFormElement>,
    registrationId: string,
  ) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusyAction(`registration-profile:${registrationId}`);
    try {
      const response = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrations: [
            { id: registrationId, ...registrationProfiles[registrationId] },
          ],
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'ذخیره اطلاعات ثبت‌نام ناموفق بود');
      }
      setMessage('اطلاعات ثبت‌نام به‌روزرسانی شد.');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'ذخیره اطلاعات ثبت‌نام ناموفق بود',
      );
    } finally {
      setBusyAction(null);
    }
  };

  const requestContactVerification = async (channel: 'email' | 'phone') => {
    setError('');
    setMessage('');
    setBusyAction(`verify:${channel}`);
    try {
      const response = await fetch('/api/student/profile/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request-contact',
          channel,
          value: profile[channel],
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || 'ارسال کد ناموفق بود');
      setMessage(result.message);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'ارسال کد ناموفق بود',
      );
    } finally {
      setBusyAction(null);
    }
  };

  const confirmContactVerification = async (channel: 'email' | 'phone') => {
    setError('');
    setMessage('');
    setBusyAction(`confirm:${channel}`);
    try {
      const response = await fetch('/api/student/profile/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-contact',
          channel,
          code: verificationCodes[channel],
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || 'تأیید کد ناموفق بود');
      setMessage(result.message);
      setVerificationCodes({ ...verificationCodes, [channel]: '' });
      setCurrentContact({ ...currentContact, [channel]: profile[channel] });
      await refreshUser();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'تأیید کد ناموفق بود',
      );
    } finally {
      setBusyAction(null);
    }
  };

  const requestPasswordVerification = async () => {
    setError('');
    setMessage('');
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setError('تکرار رمز عبور با رمز جدید مطابقت ندارد.');
      return;
    }
    setBusyAction('password-request');
    try {
      const response = await fetch('/api/student/profile/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request-password',
          channel: passwordForm.channel,
          password: passwordForm.password,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || 'ارسال کد ناموفق بود');
      setPasswordForm({ ...passwordForm, codeRequested: true });
      setMessage(result.message);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'ارسال کد ناموفق بود',
      );
    } finally {
      setBusyAction(null);
    }
  };

  const confirmPasswordVerification = async () => {
    setError('');
    setMessage('');
    setBusyAction('password-confirm');
    try {
      const response = await fetch('/api/student/profile/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-password',
          channel: passwordForm.channel,
          code: passwordForm.code,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || 'تأیید کد ناموفق بود');
      setPasswordForm({
        ...passwordForm,
        password: '',
        confirmPassword: '',
        code: '',
        codeRequested: false,
      });
      setMessage(result.message);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'تأیید کد ناموفق بود',
      );
    } finally {
      setBusyAction(null);
    }
  };

  const handleEnrollment = async (programId: string) => {
    setBusyAction(`enroll:${programId}`);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/student/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'ثبت‌نام ناموفق بود');
      setMessage(`درخواست ثبت‌نام در «${result.program.name}» ارسال شد.`);
      await router.replace(router.asPath);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'ثبت‌نام ناموفق بود',
      );
    } finally {
      setBusyAction(null);
    }
  };

  const handleCancellation = async (registrationId: string) => {
    setBusyAction(`cancel:${registrationId}`);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/student/registrations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || 'لغو ثبت‌نام ناموفق بود');
      setMessage(result.message);
      await router.replace(router.asPath);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'لغو ثبت‌نام ناموفق بود',
      );
    } finally {
      setBusyAction(null);
    }
  };

  const handlePayment = async () => {
    setBusyAction('payment');
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/student/payments', { method: 'POST' });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || 'ایجاد پرداخت ناموفق بود');
      window.location.assign(result.paymentUrl);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'ایجاد پرداخت ناموفق بود',
      );
      setBusyAction(null);
    }
  };

  return (
    <Layout
      title="پنل دانش‌آموز - آکادمی فوتبال افشین پیروانی"
      description="مدیریت اطلاعات، ثبت‌نام‌ها و پرداخت‌های دانش‌آموز"
      noindex={true}
    >
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-gray-900">پنل دانش‌آموز</h1>
              <div className="flex items-center gap-4">
                <span className="text-gray-700">
                  {profile.firstName} {profile.lastName}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {(message || paymentMessage) && (
            <p
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
            >
              {message || paymentMessage}
            </p>
          )}
          {(error || paymentError) && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
            >
              {error || paymentError}
            </p>
          )}

          <section className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-linear-to-r from-primary-600 to-primary-700 px-6 py-4 rounded-t-lg">
              <h2 className="text-white text-lg font-semibold">
                اطلاعات پروفایل
              </h2>
            </div>
            <form onSubmit={handleProfileSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="block text-sm font-medium text-gray-700">
                  نام
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="given-name"
                    value={profile.firstName}
                    onChange={(event) =>
                      setProfile({ ...profile, firstName: event.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 py-2 pl-11 pr-3"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  نام خانوادگی
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="family-name"
                    value={profile.lastName}
                    onChange={(event) =>
                      setProfile({ ...profile, lastName: event.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  ایمیل
                  <input
                    type="email"
                    autoComplete="email"
                    value={profile.email}
                    onChange={(event) =>
                      setProfile({ ...profile, email: event.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </label>
                <div className="flex flex-wrap items-end gap-2">
                  <button
                    type="button"
                    disabled={!profile.email || busyAction === 'verify:email'}
                    onClick={() => void requestContactVerification('email')}
                    className="rounded-lg border border-primary-600 px-3 py-2 text-sm text-primary-700 disabled:opacity-50"
                  >
                    {busyAction === 'verify:email'
                      ? 'در حال ارسال...'
                      : 'ارسال کد ایمیل'}
                  </button>
                  <label className="flex-1 text-sm text-gray-700">
                    کد ایمیل
                    <input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={verificationCodes.email}
                      onChange={(event) =>
                        setVerificationCodes({
                          ...verificationCodes,
                          email: event.target.value.replace(/\D/g, ''),
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={
                      verificationCodes.email.length !== 6 ||
                      busyAction === 'confirm:email'
                    }
                    onClick={() => void confirmContactVerification('email')}
                    className="rounded-lg bg-primary-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                  >
                    تأیید ایمیل
                  </button>
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  تلفن
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={profile.phone}
                    onChange={(event) =>
                      setProfile({ ...profile, phone: event.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </label>
                <div className="flex flex-wrap items-end gap-2">
                  <button
                    type="button"
                    disabled={!profile.phone || busyAction === 'verify:phone'}
                    onClick={() => void requestContactVerification('phone')}
                    className="rounded-lg border border-primary-600 px-3 py-2 text-sm text-primary-700 disabled:opacity-50"
                  >
                    {busyAction === 'verify:phone'
                      ? 'در حال ارسال...'
                      : 'ارسال کد پیامکی'}
                  </button>
                  <label className="flex-1 text-sm text-gray-700">
                    کد پیامکی
                    <input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={verificationCodes.phone}
                      onChange={(event) =>
                        setVerificationCodes({
                          ...verificationCodes,
                          phone: event.target.value.replace(/\D/g, ''),
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={
                      verificationCodes.phone.length !== 6 ||
                      busyAction === 'confirm:phone'
                    }
                    onClick={() => void confirmContactVerification('phone')}
                    className="rounded-lg bg-primary-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                  >
                    تأیید تلفن
                  </button>
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  تاریخ تولد (برای ثبت‌نام الزامی است)
                  <PersianDatePicker
                    id="profile-birth-date"
                    autoComplete="bday"
                    value={profile.birthDate}
                    onChange={(birthDate) =>
                      setProfile({ ...profile, birthDate })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                  <span className="mt-1 block text-xs font-normal text-gray-500">
                    تاریخ را با تقویم شمسی و به‌شکل سال/ماه/روز وارد کنید.
                  </span>
                </label>
              </div>
              <label className="mt-5 flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={profile.marketingOptIn}
                  onChange={(event) =>
                    setProfile({
                      ...profile,
                      marketingOptIn: event.target.checked,
                    })
                  }
                  className="mt-1"
                />
                <span>
                  مایلم اخبار و پیشنهادهای بازاریابی آکادمی را از طریق ایمیل یا
                  پیامک دریافت کنم. هر زمان بخواهم می‌توانم این رضایت را لغو
                  کنم.
                </span>
              </label>
              <button
                type="submit"
                disabled={busyAction === 'profile'}
                className="mt-5 rounded-lg bg-primary-600 px-5 py-2 text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {busyAction === 'profile' ? 'در حال ذخیره...' : 'ذخیره اطلاعات'}
              </button>
            </form>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              تغییر رمز عبور
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              برای نهایی‌کردن تغییر رمز، کد تأیید به ایمیل یا تلفن فعلی شما
              ارسال می‌شود.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                روش دریافت کد
                <select
                  value={passwordForm.channel}
                  onChange={(event) =>
                    setPasswordForm({
                      ...passwordForm,
                      channel: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  {currentContact.email && (
                    <option value="email">ایمیل فعلی</option>
                  )}
                  {currentContact.phone && (
                    <option value="phone">تلفن فعلی</option>
                  )}
                  {!currentContact.email && !currentContact.phone && (
                    <option value="phone">ابتدا ایمیل یا تلفن ثبت کنید</option>
                  )}
                </select>
              </label>
              <label className="text-sm font-medium text-gray-700">
                رمز عبور جدید
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  value={passwordForm.password}
                  onChange={(event) =>
                    setPasswordForm({
                      ...passwordForm,
                      password: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                تکرار رمز عبور جدید
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              {passwordForm.codeRequested && (
                <label className="text-sm font-medium text-gray-700">
                  کد تأیید
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={passwordForm.code}
                    onChange={(event) =>
                      setPasswordForm({
                        ...passwordForm,
                        code: event.target.value.replace(/\D/g, ''),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  />
                </label>
              )}
            </div>
            {passwordForm.codeRequested ? (
              <button
                type="button"
                disabled={
                  passwordForm.code.length !== 6 ||
                  busyAction === 'password-confirm'
                }
                onClick={() => void confirmPasswordVerification()}
                className="mt-4 rounded-lg bg-primary-600 px-5 py-2 text-white disabled:opacity-50"
              >
                تأیید کد و تغییر رمز
              </button>
            ) : (
              <button
                type="button"
                disabled={
                  !passwordForm.password || busyAction === 'password-request'
                }
                onClick={() => void requestPasswordVerification()}
                className="mt-4 rounded-lg bg-primary-600 px-5 py-2 text-white disabled:opacity-50"
              >
                {busyAction === 'password-request'
                  ? 'در حال ارسال...'
                  : 'ارسال کد تأیید'}
              </button>
            )}
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-linear-to-r from-primary-600 to-primary-700 px-6 py-4 rounded-t-lg flex flex-wrap justify-between items-center gap-3">
              <h2 className="text-white text-lg font-semibold">
                ثبت‌نام‌های من
              </h2>
            </div>
            <div className="p-6">
              {student.registrations.length === 0 ? (
                <p className="py-6 text-center text-gray-600">
                  هنوز در برنامه‌ای ثبت‌نام نکرده‌اید.
                </p>
              ) : (
                <div className="space-y-4">
                  {student.registrations.map((registration) => {
                    const registrationProfile =
                      registrationProfiles[registration.id];
                    const updateRegistrationProfile = (
                      field: keyof StudentRegistrationProfileFormValues,
                      value: string,
                    ) =>
                      setRegistrationProfiles((current) => ({
                        ...current,
                        [registration.id]: {
                          ...current[registration.id],
                          [field]: value,
                        },
                      }));
                    const due = Math.max(
                      registration.status === 'CANCELLED'
                        ? 0
                        : registration.totalAmount - registration.paidAmount,
                      0,
                    );
                    const canCancel =
                      activeStatuses.has(registration.status) &&
                      registration.paidAmount === 0 &&
                      !registration.payments.some((payment) =>
                        ['PENDING', 'COMPLETED', 'REFUND_REQUIRED'].includes(
                          payment.status,
                        ),
                      );
                    return (
                      <article
                        key={registration.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {registration.program.name}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              مربی:{' '}
                              {registration.program.coach
                                ? `${registration.program.coach.firstName} ${registration.program.coach.lastName}`
                                : '—'}
                            </p>
                            <p className="text-gray-600 mt-1">
                              وضعیت:{' '}
                              {registrationStatus[registration.status] ??
                                registration.status}
                            </p>
                            <p className="text-gray-600 mt-1">
                              شهریه: {formatToman(registration.totalAmount)} •
                              پرداخت‌شده: {formatToman(registration.paidAmount)}{' '}
                              • مانده: {formatToman(due)}
                            </p>
                          </div>
                          {canCancel && (
                            <button
                              type="button"
                              disabled={
                                busyAction === `cancel:${registration.id}`
                              }
                              onClick={() =>
                                void handleCancellation(registration.id)
                              }
                              className="rounded-lg border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50 disabled:opacity-60"
                            >
                              {busyAction === `cancel:${registration.id}`
                                ? 'در حال لغو...'
                                : 'لغو ثبت‌نام'}
                            </button>
                          )}
                        </div>
                        {activeStatuses.has(registration.status) &&
                          !canCancel && (
                            <p className="mt-3 text-sm text-gray-600">
                              برای لغو ثبت‌نامی که پرداخت آن آغاز یا انجام شده
                              است،{' '}
                              <Link
                                href="/contact"
                                className="text-primary-700 underline"
                              >
                                با آکادمی تماس بگیرید
                              </Link>
                              .
                            </p>
                          )}
                        <details className="mt-4 border-t border-gray-100 pt-3">
                          <summary className="cursor-pointer text-sm font-medium text-primary-700">
                            ویرایش اطلاعات این ثبت‌نام
                          </summary>
                          <form
                            onSubmit={(event) =>
                              void handleRegistrationProfileSubmit(
                                event,
                                registration.id,
                              )
                            }
                            className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
                          >
                            <label className="text-sm font-medium text-gray-700">
                              سطح تجربه
                              <select
                                value={registrationProfile.experienceLevel}
                                onChange={(event) =>
                                  updateRegistrationProfile(
                                    'experienceLevel',
                                    event.target.value,
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                              >
                                <option value="">انتخاب نشده</option>
                                <option value="beginner">مبتدی</option>
                                <option value="intermediate">متوسط</option>
                                <option value="advanced">پیشرفته</option>
                              </select>
                            </label>
                            <label className="text-sm font-medium text-gray-700">
                              نام والد یا سرپرست
                              <input
                                maxLength={100}
                                value={registrationProfile.parentName}
                                onChange={(event) =>
                                  updateRegistrationProfile(
                                    'parentName',
                                    event.target.value,
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                              />
                            </label>
                            <label className="text-sm font-medium text-gray-700">
                              ایمیل والد یا سرپرست
                              <input
                                type="email"
                                maxLength={254}
                                value={registrationProfile.parentEmail}
                                onChange={(event) =>
                                  updateRegistrationProfile(
                                    'parentEmail',
                                    event.target.value,
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                              />
                            </label>
                            <label className="text-sm font-medium text-gray-700">
                              نام تماس اضطراری
                              <input
                                maxLength={100}
                                value={registrationProfile.emergencyContactName}
                                onChange={(event) =>
                                  updateRegistrationProfile(
                                    'emergencyContactName',
                                    event.target.value,
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                              />
                            </label>
                            <label className="text-sm font-medium text-gray-700">
                              تلفن تماس اضطراری
                              <input
                                type="tel"
                                maxLength={20}
                                value={
                                  registrationProfile.emergencyContactPhone
                                }
                                onChange={(event) =>
                                  updateRegistrationProfile(
                                    'emergencyContactPhone',
                                    event.target.value,
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                              />
                            </label>
                            <label className="text-sm font-medium text-gray-700">
                              شرایط پزشکی
                              <textarea
                                maxLength={2000}
                                rows={3}
                                value={registrationProfile.medicalConditions}
                                onChange={(event) =>
                                  updateRegistrationProfile(
                                    'medicalConditions',
                                    event.target.value,
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                              />
                            </label>
                            <button
                              type="submit"
                              disabled={
                                busyAction ===
                                `registration-profile:${registration.id}`
                              }
                              className="w-fit rounded-lg bg-primary-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                            >
                              {busyAction ===
                              `registration-profile:${registration.id}`
                                ? 'در حال ذخیره...'
                                : 'ذخیره اطلاعات'}
                            </button>
                          </form>
                        </details>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="mt-8 border-t border-gray-200 pt-6">
                {studentAge === null ? (
                  <p className="text-sm text-gray-600">
                    برای نمایش برنامه‌های متناسب با سن، تاریخ تولد شمسی را در
                    پروفایل ثبت کنید.
                  </p>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900">
                      برنامه‌های مناسب سن شما ({toPersianDigits(studentAge)}{' '}
                      سال)
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      فقط برنامه‌هایی نمایش داده می‌شوند که محدوده سنی آن‌ها با
                      تاریخ تولد ثبت‌شده شما سازگار است.
                    </p>
                    {availablePrograms.length > 0 ? (
                      <ul className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {availablePrograms.map((program) => (
                          <li
                            key={program.id}
                            className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">
                                {program.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {toPersianDigits(program.minAge)} تا{' '}
                                {toPersianDigits(program.maxAge)} سال •{' '}
                                {formatToman(program.price)}
                              </p>
                            </div>
                            <button
                              type="button"
                              disabled={busyAction === `enroll:${program.id}`}
                              onClick={() => void handleEnrollment(program.id)}
                              className="shrink-0 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-60"
                            >
                              {busyAction === `enroll:${program.id}`
                                ? 'در حال ثبت‌نام...'
                                : 'ثبت‌نام'}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm text-gray-600">
                        در حال حاضر برنامه فعالی متناسب با سن شما وجود ندارد.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  پرداخت شهریه
                </h2>
                <p className="mt-1 text-gray-600">
                  مانده شهریه برنامه‌های فعال: {formatToman(totalDue)}
                </p>
              </div>
              <button
                type="button"
                disabled={totalDue <= 0 || busyAction === 'payment'}
                onClick={() => void handlePayment()}
                className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busyAction === 'payment'
                  ? 'در حال انتقال...'
                  : 'پرداخت از طریق زرین‌پال'}
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              پرداخت برای تمام مانده برنامه‌های فعال به‌صورت یکجا انجام می‌شود.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<
  StudentDashboardViewModel
> = async (context) => {
  const token = context.req.cookies.auth_token;
  if (!token) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  try {
    const [{ jwtVerify }, { getJwtSecret }, { getPrisma }] = await Promise.all([
      import('jose'),
      import('@/lib/auth'),
      import('@/lib/db'),
    ]);
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (typeof payload.userId !== 'string') {
      return { redirect: { destination: '/login', permanent: false } };
    }

    const db = await getPrisma();
    const [student, programs] = await Promise.all([
      db.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          birthDate: true,
          marketingOptIn: true,
          role: true,
          registrations: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              paidAmount: true,
              experienceLevel: true,
              parentName: true,
              parentEmail: true,
              emergencyContactName: true,
              emergencyContactPhone: true,
              medicalConditions: true,
              payments: { select: { status: true } },
              program: {
                select: {
                  id: true,
                  name: true,
                  coach: {
                    select: { firstName: true, lastName: true },
                  },
                },
              },
            },
            orderBy: { registeredAt: 'desc' },
          },
        },
      }),
      db.program.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          price: true,
          minAge: true,
          maxAge: true,
        },
        orderBy: { displayOrder: 'asc' },
      }),
    ]);

    if (!student || student.role !== 'STUDENT') {
      return { redirect: { destination: '/login', permanent: false } };
    }

    return {
      props: {
        student: {
          ...student,
          birthDate: student.birthDate?.toISOString() ?? null,
        },
        programs,
      },
    };
  } catch (error) {
    console.error('Student dashboard load error:', error);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default StudentDashboardPage;
