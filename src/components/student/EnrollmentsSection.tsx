import Link from 'next/link';
import { formatToman, toPersianDigits } from '@/lib/format';
import type {
  StudentDashboardProgramViewModel,
  StudentRegistrationProfileFormValues,
  StudentRegistrationViewModel,
} from '@/types/viewModels/student';

const activeStatuses = new Set(['PENDING', 'APPROVED']);
const registrationStatus: Record<string, string> = {
  PENDING: 'در انتظار تأیید',
  APPROVED: 'تأیید شده',
  CANCELLED: 'لغو شده',
  COMPLETED: 'تکمیل شده',
};

export default function EnrollmentsSection({
  registrations,
  registrationProfiles,
  availablePrograms,
  studentAge,
  busyAction,
  onCancel,
  onProfileSubmit,
  onProfileChange,
  onEnroll,
}: {
  registrations: StudentRegistrationViewModel[];
  registrationProfiles: Record<string, StudentRegistrationProfileFormValues>;
  availablePrograms: StudentDashboardProgramViewModel[];
  studentAge: number | null;
  busyAction: string | null;
  onCancel: (registrationId: string) => void;
  onProfileSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    registrationId: string,
  ) => void;
  onProfileChange: (
    registrationId: string,
    field: keyof StudentRegistrationProfileFormValues,
    value: string,
  ) => void;
  onEnroll: (programId: string) => void;
}) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="bg-linear-to-r from-primary-600 to-primary-700 px-6 py-4 rounded-t-lg flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-white text-lg font-semibold">ثبت‌نام‌های من</h2>
      </div>
      <div className="p-6">
        {registrations.length === 0 ? (
          <p className="py-6 text-center text-gray-600">
            هنوز در برنامه‌ای ثبت‌نام نکرده‌اید.
          </p>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => {
              const registrationProfile = registrationProfiles[registration.id];
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
                        پرداخت‌شده: {formatToman(registration.paidAmount)} •
                        مانده: {formatToman(due)}
                      </p>
                    </div>
                    {canCancel && (
                      <button
                        type="button"
                        disabled={busyAction === `cancel:${registration.id}`}
                        onClick={() => onCancel(registration.id)}
                        className="rounded-lg border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        {busyAction === `cancel:${registration.id}`
                          ? 'در حال لغو...'
                          : 'لغو ثبت‌نام'}
                      </button>
                    )}
                  </div>
                  {activeStatuses.has(registration.status) && !canCancel && (
                    <p className="mt-3 text-sm text-gray-600">
                      برای لغو ثبت‌نامی که پرداخت آن آغاز یا انجام شده است،{' '}
                      <Link href="/contact" className="text-primary-700 underline">
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
                        onProfileSubmit(event, registration.id)
                      }
                      className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
                    >
                      <label className="text-sm font-medium text-gray-700">
                        سطح تجربه
                        <select
                          value={registrationProfile.experienceLevel}
                          onChange={(event) =>
                            onProfileChange(
                              registration.id,
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
                            onProfileChange(
                              registration.id,
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
                            onProfileChange(
                              registration.id,
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
                            onProfileChange(
                              registration.id,
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
                          value={registrationProfile.emergencyContactPhone}
                          onChange={(event) =>
                            onProfileChange(
                              registration.id,
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
                            onProfileChange(
                              registration.id,
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
              برای نمایش برنامه‌های متناسب با سن، تاریخ تولد شمسی را در پروفایل
              ثبت کنید.
            </p>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900">
                برنامه‌های مناسب سن شما ({toPersianDigits(studentAge)} سال)
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                فقط برنامه‌هایی نمایش داده می‌شوند که محدوده سنی آن‌ها با تاریخ
                تولد ثبت‌شده شما سازگار است.
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
                        onClick={() => onEnroll(program.id)}
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
  );
}
