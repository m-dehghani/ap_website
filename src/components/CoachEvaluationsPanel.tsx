import { FormEvent, useState } from 'react';

type CoachEvaluation = {
  id: string;
  user: { firstName: string; lastName: string };
  technical: number;
  physical: number;
  mental: number;
  teamwork: number;
  overall: number;
  notes: string | null;
  createdAt: string;
};

type CoachStudent = {
  id: string;
  firstName: string;
  lastName: string;
};

const scoreFields = [
  { name: 'technical', label: 'فنی' },
  { name: 'physical', label: 'بدنی' },
  { name: 'mental', label: 'ذهنی' },
  { name: 'teamwork', label: 'کار تیمی' },
  { name: 'overall', label: 'ارزیابی کلی' },
] as const;

const scoreLabels: Record<(typeof scoreFields)[number]['name'], string> = {
  technical: 'فنی',
  physical: 'بدنی',
  mental: 'ذهنی',
  teamwork: 'کار تیمی',
  overall: 'ارزیابی کلی',
};

export default function CoachEvaluationsPanel({
  students,
  evaluations,
}: {
  students: CoachStudent[];
  evaluations: CoachEvaluation[];
}) {
  const [records, setRecords] = useState(evaluations);
  const [scores, setScores] = useState({
    technical: '5',
    physical: '5',
    mental: '5',
    teamwork: '5',
    overall: '5',
  });
  const [userId, setUserId] = useState('');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submitEvaluation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFeedback('');
    setError('');
    try {
      const response = await fetch('/api/coach/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...Object.fromEntries(
            Object.entries(scores).map(([field, value]) => [field, Number(value)]),
          ),
          notes,
        }),
      });
      if (!response.ok) {
        setError('ثبت ارزیابی انجام نشد. اطلاعات را بررسی کنید.');
        return;
      }
      const result = await response.json();
      if (result.evaluation) {
        setRecords((current) => [result.evaluation, ...current]);
      }
      setFeedback('ارزیابی با موفقیت ثبت شد');
      setNotes('');
    } catch {
      setError('ارتباط با سرور برقرار نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-8 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="rounded-t-lg bg-linear-to-r from-primary-600 to-primary-700 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">ارزیابی بازیکنان</h2>
      </div>
      <div className="grid gap-8 p-6 lg:grid-cols-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900">ثبت ارزیابی</h3>
          <form
            action="/api/coach/evaluations"
            method="post"
            aria-label="ثبت ارزیابی بازیکن"
            className="mt-4 space-y-4"
            onSubmit={submitEvaluation}
          >
            <div>
              <label
                htmlFor="evaluation-student"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                دانش‌آموز
              </label>
              <select
                id="evaluation-student"
                name="userId"
                required
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">انتخاب دانش‌آموز</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="mb-1 text-sm font-medium text-gray-700">
                امتیازها (همه موارد الزامی، از ۱ تا ۱۰)
              </legend>
              <div id="evaluation-score-help" className="sr-only">
                امتیازها باید عدد صحیحی بین ۱ تا ۱۰ باشند.
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {scoreFields.map(({ name, label }) => (
                  <div key={name}>
                    <label
                      htmlFor={`evaluation-${name}`}
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      {label}
                    </label>
                    <input
                      id={`evaluation-${name}`}
                      name={name}
                      type="number"
                      min={1}
                      max={10}
                      step={1}
                      required
                      aria-describedby="evaluation-score-help"
                      value={scores[name]}
                      onChange={(event) =>
                        setScores((current) => ({
                          ...current,
                          [name]: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    />
                  </div>
                ))}
              </div>
            </fieldset>
            <div>
              <label
                htmlFor="evaluation-notes"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                یادداشت
              </label>
              <textarea
                id="evaluation-notes"
                name="notes"
                maxLength={2000}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            {feedback && (
              <p role="status" aria-live="polite" className="text-sm text-green-700">
                {feedback}
              </p>
            )}
            {error && (
              <p role="alert" aria-live="assertive" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={saving || students.length === 0}
              className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {saving ? 'در حال ثبت...' : 'ثبت ارزیابی'}
            </button>
          </form>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">ارزیابی‌های ثبت‌شده</h3>
          {records.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">
              هنوز ارزیابی‌ای ثبت نشده است.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-gray-100">
              {records.map((record) => (
                <li key={record.id} className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-gray-900">
                      {record.user.firstName} {record.user.lastName}
                    </p>
                    <time
                      className="text-sm text-gray-600"
                      dateTime={record.createdAt}
                    >
                      {new Date(record.createdAt).toLocaleDateString('fa-IR')}
                    </time>
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                    {scoreFields.map(({ name }) => (
                      <div key={name}>
                        <dt className="inline text-gray-600">{scoreLabels[name]}: </dt>
                        <dd className="inline font-medium text-gray-900">
                          {record[name]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {record.notes && (
                    <p className="mt-2 text-sm text-gray-700">{record.notes}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
