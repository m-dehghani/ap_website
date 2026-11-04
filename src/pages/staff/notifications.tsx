import { useEffect, useState, type FormEvent } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';

type Audience = 'student' | 'program' | 'marketing';
type Channel = 'email' | 'sms' | 'both';
type Purpose = 'academy' | 'marketing';

interface DirectoryData {
  programs: Array<{ id: string; name: string }>;
  students: Array<{ id: string; firstName: string; lastName: string }>;
}

const emptyDirectory: DirectoryData = { programs: [], students: [] };

export default function StaffNotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [directory, setDirectory] = useState(emptyDirectory);
  const [audience, setAudience] = useState<Audience>('program');
  const [channel, setChannel] = useState<Channel>('email');
  const [purpose, setPurpose] = useState<Purpose>('academy');
  const [programId, setProgramId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user || !['ADMIN', 'COACH'].includes(user.role)) {
      void router.replace('/login');
      return;
    }
    void fetch('/api/staff/notifications')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'دریافت اطلاعات ناموفق بود');
        setDirectory(data);
        setProgramId(data.programs[0]?.id ?? '');
        setStudentId(data.students[0]?.id ?? '');
      })
      .catch((fetchError: unknown) => {
        setError(
          fetchError instanceof Error ? fetchError.message : 'دریافت اطلاعات ناموفق بود',
        );
      });
  }, [loading, router, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      audience !== 'student' &&
      !window.confirm('پیام برای یک گروه ارسال می‌شود. ارسال را تأیید می‌کنید؟')
    ) {
      return;
    }
    setError('');
    setStatus('');
    setBusy(true);
    try {
      const response = await fetch('/api/staff/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audience,
          ...(audience === 'student' ? { studentId } : {}),
          ...(audience === 'program' ? { programId } : {}),
          purpose,
          channel,
          ...(channel !== 'sms' ? { subject } : {}),
          message,
        }),
      });
      const result = await response.json();
      if (!response.ok && response.status !== 207) {
        throw new Error(result.message || 'ارسال پیام ناموفق بود');
      }
      setStatus(
        `${result.message} تعداد مخاطبان: ${result.recipients}، ارسال‌شده: ${result.sent}، ناموفق: ${result.failed}.`,
      );
      if (result.failed === 0) setMessage('');
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'ارسال پیام ناموفق بود',
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user || !['ADMIN', 'COACH'].includes(user.role)) {
    return (
      <Layout title="در حال بررسی دسترسی..." noindex>
        <div className="flex min-h-64 items-center justify-center" role="status">
          در حال بررسی دسترسی...
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="ارسال پیام به دانش‌آموزان" noindex>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ارسال پیام</h1>
            <p className="mt-2 text-gray-600">
              ارسال ایمیل یا پیامک به یک دانش‌آموز یا گروه برنامه.
            </p>
          </div>
          <Link
            href={user.role === 'ADMIN' ? '/admin' : '/coach/dashboard'}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            بازگشت به پنل
          </Link>
        </div>

        {(status || error) && (
          <p
            role={error ? 'alert' : 'status'}
            className={`mb-5 rounded-lg border p-4 ${
              error
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-green-200 bg-green-50 text-green-800'
            }`}
          >
            {error || status}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              مخاطبان
              <select
                value={audience}
                onChange={(event) => {
                  const nextAudience = event.target.value as Audience;
                  setAudience(nextAudience);
                  if (nextAudience === 'marketing') setPurpose('marketing');
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="student">یک دانش‌آموز</option>
                <option value="program">دانش‌آموزان یک برنامه</option>
                {user.role === 'ADMIN' && (
                  <option value="marketing">همه دانش‌آموزان رضایت‌داده</option>
                )}
              </select>
            </label>

            {audience === 'student' && (
              <label className="text-sm font-medium text-gray-700">
                دانش‌آموز
                <select
                  required
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  {directory.students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {audience === 'program' && (
              <label className="text-sm font-medium text-gray-700">
                برنامه
                <select
                  required
                  value={programId}
                  onChange={(event) => setProgramId(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  {directory.programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {audience !== 'marketing' && (
              <label className="text-sm font-medium text-gray-700">
                نوع پیام
                <select
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value as Purpose)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="academy">اطلاع‌رسانی آکادمی</option>
                  <option value="marketing">بازاریابی (فقط با رضایت دانش‌آموز)</option>
                </select>
              </label>
            )}

            <label className="text-sm font-medium text-gray-700">
              روش ارسال
              <select
                value={channel}
                onChange={(event) => setChannel(event.target.value as Channel)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="email">ایمیل</option>
                <option value="sms">پیامک</option>
                <option value="both">ایمیل و پیامک</option>
              </select>
            </label>
          </div>

          {audience === 'marketing' && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              این پیام فقط برای دانش‌آموزانی ارسال می‌شود که دریافت پیام‌های بازاریابی را پذیرفته‌اند.
            </p>
          )}
          {purpose === 'marketing' && audience === 'program' && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              فقط اعضای این برنامه که دریافت پیام‌های بازاریابی را پذیرفته‌اند دریافت می‌کنند.
            </p>
          )}

          {channel !== 'sms' && (
            <label className="block text-sm font-medium text-gray-700">
              موضوع ایمیل
              <input
                required
                maxLength={200}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
          )}

          <label className="block text-sm font-medium text-gray-700">
            متن پیام
            <textarea
              required
              rows={7}
              maxLength={channel === 'email' ? 5000 : 1000}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
            <span className="mt-1 block text-xs font-normal text-gray-500">
              برای پیامک حداکثر ۱۰۰۰ نویسه مجاز است؛ حداکثر ۲۰۰ مخاطب در هر ارسال.
            </span>
          </label>

          <button
            type="submit"
            disabled={
              busy ||
              !message.trim() ||
              (audience === 'program' && !programId) ||
              (audience === 'student' && !studentId)
            }
            className="rounded-lg bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'در حال ارسال...' : 'ارسال پیام'}
          </button>
        </form>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { getSession } = await import('@/lib/auth');
  const session = await getSession(req);
  if (!session || !['ADMIN', 'COACH'].includes(session.role)) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return { props: {} };
};
