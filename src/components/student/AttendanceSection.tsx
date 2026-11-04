import type { StudentAttendanceViewModel } from '@/types/viewModels/student';

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
          <ul className="divide-y divide-gray-100">
            {attendance.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {entry.session.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {entry.session.program.name} •{' '}
                    {new Date(entry.session.date).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {attendanceStatusLabel[entry.status] ?? entry.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
