import { useState } from 'react';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface AttendanceRosterStudent {
  userId: string;
  firstName: string;
  lastName: string;
  status: AttendanceStatus | null;
}

interface AttendanceRosterProps {
  sessionId: string;
  endpoint: string;
  roster: AttendanceRosterStudent[];
}

const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: 'PRESENT', label: 'حاضر' },
  { value: 'ABSENT', label: 'غایب' },
  { value: 'LATE', label: 'با تأخیر' },
  { value: 'EXCUSED', label: 'غیبت موجه' },
];

export default function AttendanceRoster({
  sessionId,
  endpoint,
  roster,
}: AttendanceRosterProps) {
  const [statuses, setStatuses] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      roster.map((student) => [student.userId, student.status ?? '']),
    ),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendance: roster.map((student) => ({
            userId: student.userId,
            status: statuses[student.userId],
          })),
        }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || 'ذخیره حضور و غیاب ناموفق بود');
      }
      setMessage('وضعیت حضور ثبت شد');
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'ذخیره حضور و غیاب ناموفق بود',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
      aria-labelledby={`attendance-heading-${sessionId}`}
    >
      <h3
        id={`attendance-heading-${sessionId}`}
        className="text-base font-semibold text-gray-900"
      >
        حضور و غیاب
      </h3>
      {roster.length === 0 ? (
        <p className="mt-2 text-sm text-gray-600">
          دانش‌آموزی در این برنامه ثبت‌نام نکرده است.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          <fieldset disabled={saving} className="space-y-3">
            <legend className="sr-only">وضعیت حضور دانش‌آموزان</legend>
            {roster.map((student) => (
              <label
                key={student.userId}
                htmlFor={`attendance-${sessionId}-${student.userId}`}
                className="flex flex-col gap-2 text-sm font-medium text-gray-800 sm:flex-row sm:items-center sm:justify-between"
              >
                <span>
                  {student.firstName} {student.lastName}
                </span>
                <select
                  id={`attendance-${sessionId}-${student.userId}`}
                  name={`attendance-${student.userId}`}
                  required
                  value={statuses[student.userId] ?? ''}
                  onChange={(event) =>
                    setStatuses((current) => ({
                      ...current,
                      [student.userId]: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2"
                >
                  <option value="">انتخاب وضعیت</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </fieldset>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800 disabled:cursor-wait disabled:opacity-60"
          >
            {saving ? 'در حال ذخیره…' : 'ذخیره حضور و غیاب'}
          </button>
        </form>
      )}
      {message && (
        <p role="status" aria-live="polite" className="mt-3 text-sm text-green-800">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" aria-live="assertive" className="mt-3 text-sm text-red-800">
          {error}
        </p>
      )}
    </section>
  );
}
