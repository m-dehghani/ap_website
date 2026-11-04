import type { StudentAttendanceViewModel } from '@/types/viewModels/student';
import { formatDate } from '@/lib/format';

const attendanceStatusLabel: Record<string, string> = {
  PRESENT: 'حاضر',
  ABSENT: 'غایب',
  LATE: 'با تأخیر',
  EXCUSED: 'غیبت موجه',
};

export default function AttendanceSection({
  attendance,
}: {
  attendance: StudentAttendanceViewModel[];
}) {
  const sortedAttendance = [...attendance].sort(
    (first, second) =>
      new Date(second.session.date).getTime() -
      new Date(first.session.date).getTime(),
  );
  const dateKey = (value: string) => new Date(value).toISOString().slice(0, 10);
  const latestDate = sortedAttendance[0]
    ? new Date(`${dateKey(sortedAttendance[0].session.date)}T12:00:00.000Z`)
    : null;
  const attendanceByDay = new Map<
    string,
    StudentAttendanceViewModel[]
  >();
  sortedAttendance.forEach((entry) => {
    const key = dateKey(entry.session.date);
    attendanceByDay.set(key, [...(attendanceByDay.get(key) ?? []), entry]);
  });
  const calendarDays = latestDate
    ? Array.from({ length: 28 }, (_, index) => {
        const date = new Date(latestDate);
        date.setUTCDate(date.getUTCDate() - (27 - index));
        const key = date.toISOString().slice(0, 10);
        return { date, entries: attendanceByDay.get(key) ?? [] };
      })
    : [];

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="bg-linear-to-r from-primary-600 to-primary-700 px-6 py-4 rounded-t-lg">
        <h2 className="text-white text-lg font-semibold">
          سابقه حضور و غیاب
        </h2>
      </div>
      <div className="p-6">
        {attendance.length === 0 ? (
          <p className="py-4 text-center text-gray-600">
            هنوز سابقه‌ای برای حضور و غیاب ثبت نشده است.
          </p>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-800">
                تقویم آخرین ۲۸ روز ثبت‌شده
              </h3>
              <ul
                aria-label="تقویم حضور و غیاب"
                className="grid grid-cols-7 gap-2"
              >
                {calendarDays.map(({ date, entries }) => {
                  const absent = entries.some((entry) => entry.status === 'ABSENT');
                  const late = entries.some((entry) => entry.status === 'LATE');
                  const present = entries.some((entry) => entry.status === 'PRESENT');
                  const colorClass = absent
                    ? 'bg-rose-600'
                    : late
                      ? 'bg-amber-500'
                      : present
                        ? 'bg-emerald-600'
                        : entries.length
                          ? 'bg-slate-400'
                          : 'bg-gray-200';
                  const dateLabel = formatDate(date, 'fa-IR', {
                    day: 'numeric',
                    month: 'short',
                    timeZone: 'UTC',
                  });
                  const summary = entries.length
                    ? entries
                        .map(
                          (entry) =>
                            attendanceStatusLabel[entry.status] ??
                            entry.status,
                        )
                        .join('، ')
                    : 'بدون جلسه ثبت‌شده';

                  return (
                    <li
                      key={date.toISOString()}
                      aria-label={`${dateLabel}: ${summary}`}
                      title={`${dateLabel}: ${summary}`}
                      className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg bg-gray-50 p-1 text-xs text-gray-700"
                    >
                      <span className={`size-2.5 rounded-full ${colorClass}`} />
                      <time dateTime={date.toISOString()}>{dateLabel}</time>
                    </li>
                  );
                })}
              </ul>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
                {[
                  ['bg-emerald-600', 'حاضر'],
                  ['bg-rose-600', 'غایب'],
                  ['bg-amber-500', 'با تأخیر'],
                  ['bg-slate-400', 'سایر ثبت‌ها'],
                  ['bg-gray-200', 'بدون جلسه'],
                ].map(([color, label]) => (
                  <li key={label} className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className={`size-2.5 rounded-full ${color}`}
                    />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <ul className="divide-y divide-gray-100">
            {sortedAttendance.map((entry) => (
              <li
                key={entry.id}
                className="dashboard-list-item flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {entry.session.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {entry.session.program.name} •{' '}
                    {formatDate(entry.session.date)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {attendanceStatusLabel[entry.status] ?? entry.status}
                </span>
              </li>
            ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
