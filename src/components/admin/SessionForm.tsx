import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { fetchJson } from '@/lib/api-client';
import type {
  AdminCoachListItem,
  AdminProgramListItem,
  AdminSessionListItem,
} from '@/types/viewModels/admin';

interface SessionFormValues {
  name: string;
  description: string;
  date: string;
  duration: string;
  location: string;
  maxCapacity: string;
  status: string;
  programId: string;
  coachId: string;
}

type SessionRecord = Pick<
  AdminSessionListItem,
  | 'name'
  | 'description'
  | 'date'
  | 'duration'
  | 'location'
  | 'maxCapacity'
  | 'status'
  | 'program'
  | 'coach'
>;

const initialValues: SessionFormValues = {
  name: '',
  description: '',
  date: '',
  duration: '60',
  location: '',
  maxCapacity: '15',
  status: 'SCHEDULED',
  programId: '',
  coachId: '',
};

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export default function SessionForm() {
  const router = useRouter();
  const sessionId =
    router.isReady && typeof router.query.id === 'string'
      ? router.query.id
      : undefined;
  const isEditing = Boolean(sessionId);
  const [formData, setFormData] = useState(initialValues);
  const [programs, setPrograms] = useState<
    Pick<AdminProgramListItem, 'id' | 'name'>[]
  >([]);
  const [coaches, setCoaches] = useState<
    Pick<AdminCoachListItem, 'id' | 'firstName' | 'lastName'>[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;

    let isCurrent = true;
    const loadFormData = async () => {
      setLoading(true);
      setError('');
      try {
        const [programOptions, coachOptions, session] = await Promise.all([
          fetchJson<Pick<AdminProgramListItem, 'id' | 'name'>[]>(
            '/api/admin/programs',
          ),
          fetchJson<
            Pick<AdminCoachListItem, 'id' | 'firstName' | 'lastName'>[]
          >('/api/admin/coaches'),
          sessionId
            ? fetchJson<SessionRecord>(`/api/admin/sessions/${sessionId}`)
            : Promise.resolve(null),
        ]);

        if (!isCurrent) return;
        setPrograms(programOptions);
        setCoaches(coachOptions);
        if (session) {
          setFormData({
            name: session.name,
            description: session.description ?? '',
            date: toDateTimeLocal(session.date),
            duration: String(session.duration),
            location: session.location,
            maxCapacity: String(session.maxCapacity),
            status: session.status,
            programId: session.program?.id ?? '',
            coachId: session.coach?.id ?? '',
          });
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'بارگذاری اطلاعات جلسه ناموفق بود',
          );
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    void loadFormData();
    return () => {
      isCurrent = false;
    };
  }, [router.isReady, sessionId]);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const date = new Date(formData.date);
    const duration = Number(formData.duration);
    const maxCapacity = Number(formData.maxCapacity);

    if (
      Number.isNaN(date.getTime()) ||
      !Number.isInteger(duration) ||
      duration < 1 ||
      !Number.isInteger(maxCapacity) ||
      maxCapacity < 1
    ) {
      setError('تاریخ، مدت جلسه و ظرفیت را به‌درستی وارد کنید.');
      return;
    }

    setSaving(true);
    try {
      const url = sessionId
        ? `/api/admin/sessions/${sessionId}`
        : '/api/admin/sessions';
      await fetchJson<SessionRecord>(url, {
        method: sessionId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          date: date.toISOString(),
          duration,
          maxCapacity,
        }),
      });
      await router.push('/admin/sessions');
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'ذخیره جلسه ناموفق بود',
      );
    } finally {
      setSaving(false);
    }
  };

  const title = isEditing ? 'ویرایش جلسه' : 'جلسه جدید';

  if (loading) {
    return (
      <AdminLayout title={title}>
        <div className="flex min-h-64 items-center justify-center" role="status">
          <span className="text-gray-600">در حال بارگذاری اطلاعات جلسه…</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={title}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <p className="mt-1 text-gray-600">اطلاعات جلسه تمرینی را تکمیل کنید.</p>
          </div>
          <Link
            href="/admin/sessions"
            className="text-primary-700 hover:text-primary-800 hover:underline"
          >
            بازگشت به فهرست جلسات
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
            {error}
          </div>
        )}

        {programs.length === 0 || coaches.length === 0 ? (
          <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
            برای برنامه‌ریزی جلسه، ابتدا دست‌کم یک برنامه آموزشی و یک مربی فعال ایجاد کنید.
          </p>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="session-name" className="mb-2 block text-sm font-medium text-gray-800">
                نام جلسه *
              </label>
              <input
                id="session-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="off"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-600 focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label htmlFor="session-date" className="mb-2 block text-sm font-medium text-gray-800">
                تاریخ و ساعت *
              </label>
              <input
                id="session-date"
                name="date"
                type="datetime-local"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-600 focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label htmlFor="session-program" className="mb-2 block text-sm font-medium text-gray-800">
                برنامه آموزشی *
              </label>
              <select
                id="session-program"
                name="programId"
                value={formData.programId}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-primary-600 focus:ring-2 focus:ring-primary-600"
              >
                <option value="">انتخاب برنامه</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="session-coach" className="mb-2 block text-sm font-medium text-gray-800">
                مربی *
              </label>
              <select
                id="session-coach"
                name="coachId"
                value={formData.coachId}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-primary-600 focus:ring-2 focus:ring-primary-600"
              >
                <option value="">انتخاب مربی</option>
                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.firstName} {coach.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="session-location" className="mb-2 block text-sm font-medium text-gray-800">
                مکان *
              </label>
              <input
                id="session-location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                autoComplete="off"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-600 focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label htmlFor="session-duration" className="mb-2 block text-sm font-medium text-gray-800">
                مدت (دقیقه) *
              </label>
              <input
                id="session-duration"
                name="duration"
                type="number"
                min="1"
                step="1"
                value={formData.duration}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-600 focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label htmlFor="session-capacity" className="mb-2 block text-sm font-medium text-gray-800">
                ظرفیت *
              </label>
              <input
                id="session-capacity"
                name="maxCapacity"
                type="number"
                min="1"
                step="1"
                value={formData.maxCapacity}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-600 focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label htmlFor="session-status" className="mb-2 block text-sm font-medium text-gray-800">
                وضعیت *
              </label>
              <select
                id="session-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-primary-600 focus:ring-2 focus:ring-primary-600"
              >
                <option value="SCHEDULED">برنامه‌ریزی شده</option>
                <option value="ONGOING">در حال برگزاری</option>
                <option value="COMPLETED">تکمیل شده</option>
                <option value="CANCELLED">لغو شده</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="session-description" className="mb-2 block text-sm font-medium text-gray-800">
              توضیحات
            </label>
            <textarea
              id="session-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-600 focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/admin/sessions"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              انصراف
            </Link>
            <button
              type="submit"
              disabled={saving || programs.length === 0 || coaches.length === 0}
              className="inline-flex items-center justify-center rounded-lg bg-primary-700 px-5 py-3 font-semibold text-white hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'در حال ذخیره…' : isEditing ? 'ذخیره تغییرات' : 'ایجاد جلسه'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
