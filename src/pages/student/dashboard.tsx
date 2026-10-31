import React, { FormEvent, useEffect, useState } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProfileSection from '@/components/student/ProfileSection';
import EnrollmentsSection from '@/components/student/EnrollmentsSection';
import PaymentsSection from '@/components/student/PaymentsSection';
import AttendanceSection from '@/components/student/AttendanceSection';
import EvaluationsSection from '@/components/student/EvaluationsSection';
import { useAuth } from '@/hooks/useAuth';
import { calculateAge, parseBirthDate, parsePersianBirthDate } from '@/lib/age';
import { formatPersianDate } from '@/lib/format';
import { FORM_VALIDATION } from '@/constants/app';
import type {
  StudentDashboardViewModel,
  StudentProfileFormValues,
  StudentRegistrationProfileFormValues,
} from '@/types/viewModels/student';

const activeStatuses = new Set(['PENDING', 'APPROVED']);

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
    if (passwordForm.password.length < FORM_VALIDATION.password.minLength) {
      setError(FORM_VALIDATION.password.message);
      return;
    }
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

          <EvaluationsSection evaluations={student.evaluations} />

          <ProfileSection
            profile={profile}
            setProfile={setProfile}
            verificationCodes={verificationCodes}
            setVerificationCodes={setVerificationCodes}
            busyAction={busyAction}
            onSubmit={handleProfileSubmit}
            onRequestVerification={(channel) => void requestContactVerification(channel)}
            onConfirmVerification={(channel) => void confirmContactVerification(channel)}
          />

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
                  minLength={FORM_VALIDATION.password.minLength}
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
                <span className="mt-1 block text-xs text-gray-500">
                  رمز عبور باید حداقل ۱۲ کاراکتر باشد.
                </span>
              </label>
              <label className="text-sm font-medium text-gray-700">
                تکرار رمز عبور جدید
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={FORM_VALIDATION.password.minLength}
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

          <EnrollmentsSection
            registrations={student.registrations}
            registrationProfiles={registrationProfiles}
            availablePrograms={availablePrograms}
            studentAge={studentAge}
            busyAction={busyAction}
            onCancel={(registrationId) => void handleCancellation(registrationId)}
            onProfileSubmit={(event, registrationId) =>
              void handleRegistrationProfileSubmit(event, registrationId)
            }
            onProfileChange={(registrationId, field, value) =>
              setRegistrationProfiles((current) => ({
                ...current,
                [registrationId]: { ...current[registrationId], [field]: value },
              }))
            }
            onEnroll={(programId) => void handleEnrollment(programId)}
          />

          <AttendanceSection attendance={student.attendance} />

          <PaymentsSection
            totalDue={totalDue}
            busyAction={busyAction}
            onPay={() => void handlePayment()}
          />
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<
  StudentDashboardViewModel
> = async (context) => {
  const { getSession } = await import('@/lib/auth');
  const session = await getSession(context.req);
  if (
    !session ||
    session.role !== 'STUDENT' ||
    session.source !== 'user'
  ) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const { getPrisma } = await import('@/lib/db');
  const db = await getPrisma();
  const [student, programs] = await Promise.all([
    db.user.findUnique({
      where: { id: session.id },
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
        attendance: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            createdAt: true,
            session: {
              select: {
                id: true,
                name: true,
                date: true,
                program: { select: { name: true } },
              },
            },
          },
        },
        evaluations: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            technical: true,
            physical: true,
            mental: true,
            teamwork: true,
            overall: true,
            notes: true,
            createdAt: true,
            coach: { select: { firstName: true, lastName: true } },
          },
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
        attendance: student.attendance.map((entry) => ({
          ...entry,
          createdAt: entry.createdAt.toISOString(),
          session: {
            ...entry.session,
            date: entry.session.date.toISOString(),
          },
        })),
        evaluations: student.evaluations.map((evaluation) => ({
          ...evaluation,
          createdAt: evaluation.createdAt.toISOString(),
        })),
      },
      programs,
    },
  };
};

export default StudentDashboardPage;
