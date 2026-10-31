import type {
  Dispatch,
  FormEvent,
  SetStateAction,
} from 'react';
import PersianDatePicker from '@/components/PersianDatePicker';
import type {
  StudentProfileFormValues,
} from '@/types/viewModels/student';

type VerificationChannel = 'email' | 'phone';

export default function ProfileSection({
  profile,
  setProfile,
  verificationCodes,
  setVerificationCodes,
  busyAction,
  onSubmit,
  onRequestVerification,
  onConfirmVerification,
}: {
  profile: StudentProfileFormValues;
  setProfile: Dispatch<SetStateAction<StudentProfileFormValues>>;
  verificationCodes: { email: string; phone: string };
  setVerificationCodes: Dispatch<
    SetStateAction<{ email: string; phone: string }>
  >;
  busyAction: string | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRequestVerification: (channel: VerificationChannel) => void;
  onConfirmVerification: (channel: VerificationChannel) => void;
}) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="bg-linear-to-r from-primary-600 to-primary-700 px-6 py-4 rounded-t-lg">
        <h2 className="text-white text-lg font-semibold">اطلاعات پروفایل</h2>
      </div>
      <form onSubmit={onSubmit} className="p-6">
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
              onClick={() => onRequestVerification('email')}
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
              onClick={() => onConfirmVerification('email')}
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
              onClick={() => onRequestVerification('phone')}
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
              onClick={() => onConfirmVerification('phone')}
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
              setProfile({ ...profile, marketingOptIn: event.target.checked })
            }
            className="mt-1"
          />
          <span>
            مایلم اخبار و پیشنهادهای بازاریابی آکادمی را از طریق ایمیل یا
            پیامک دریافت کنم. هر زمان بخواهم می‌توانم این رضایت را لغو کنم.
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
  );
}
