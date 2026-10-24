import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '@/components/Layout';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { ProgramViewModel } from '@/types/viewModels/program';
import { calculateAge, parsePersianBirthDate } from '@/lib/age';
import { toPersianDigits } from '@/lib/format';
import PersianDatePicker from '@/components/PersianDatePicker';

const registrationSchema = z
  .object({
    firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
    lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
    email: z
      .union([z.string().email('ایمیل نامعتبر است'), z.literal('')])
      .optional(),
    phone: z
      .union([
        z
          .string()
          .regex(/^\+?[\d۰-۹٠-٩\s().-]{7,20}$/, 'شماره تلفن نامعتبر است'),
        z.literal(''),
      ])
      .optional(),
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    dateOfBirth: z
      .string()
      .min(1, 'تاریخ تولد الزامی است')
      .refine((value) => parsePersianBirthDate(value) !== null, {
        message: 'تاریخ تولد را به‌صورت شمسی وارد کنید',
      }),
    program: z.string().min(1, 'لطفاً برنامه را انتخاب کنید'),
    experience: z.enum(['beginner', 'intermediate', 'advanced']),
    parentName: z.string().optional(),
    parentEmail: z
      .string()
      .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: 'ایمیل والدین نامعتبر است',
      })
      .optional(),
    medicalConditions: z.string().optional(),
    emergencyContact: z.string().min(10, 'تماس اضطراری الزامی است'),
    emergencyContactName: z.string().min(2, 'نام تماس اضطراری الزامی است'),
    terms: z.boolean().refine((val) => val === true, {
      message: 'شما باید با شرایط و قوانین موافقت کنید',
    }),
  })
  .refine((data) => Boolean(data.email?.trim() || data.phone?.trim()), {
    message: 'وارد کردن ایمیل یا شماره تلفن الزامی است',
    path: ['email'],
  });

type RegistrationFormData = z.infer<typeof registrationSchema>;

const RegisterPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [programs, setPrograms] = useState<ProgramViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const watchedDateOfBirth = watch('dateOfBirth');
  const birthDate = watchedDateOfBirth
    ? parsePersianBirthDate(watchedDateOfBirth)
    : null;
  const age = birthDate ? calculateAge(birthDate) : null;
  const queryProgram =
    typeof router.query.program === 'string' ? router.query.program : null;

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch('/api/programs');
        if (response.ok) {
          const data = await response.json();
          setPrograms(data.data);
        } else {
          toast.error('خطا در دریافت اطلاعات برنامه‌ها');
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
        toast.error('خطا در اتصال به سرور');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const filteredPrograms = useMemo(
    () =>
      age === null
        ? []
        : programs.filter(
            (program) => age >= program.minAge && age <= program.maxAge,
          ),
    [age, programs],
  );

  useEffect(() => {
    if (!queryProgram) return;
    const requestedProgram = programs.find(
      (program) => program.id === queryProgram,
    );
    if (!requestedProgram) return;
    const isEligible =
      age !== null &&
      age >= requestedProgram.minAge &&
      age <= requestedProgram.maxAge;
    setValue('program', isEligible ? queryProgram : '');
  }, [age, programs, queryProgram, setValue]);

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      const birthDate = parsePersianBirthDate(data.dateOfBirth);
      if (!birthDate) {
        toast.error('تاریخ تولد را به‌صورت شمسی و معتبر وارد کنید.');
        return;
      }

      // Transform data to match API schema
      const apiData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        programId: data.program,
        birthDate: birthDate.toISOString().slice(0, 10),
        password: data.password,
        emergencyContact: data.emergencyContact,
        emergencyContactName: data.emergencyContactName,
        parentName: data.parentName,
        parentEmail: data.parentEmail?.trim() || undefined,
        medicalConditions: data.medicalConditions,
        previousExperience: data.experience,
      };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        toast.success('ثبت نام با موفقیت انجام شد!');
        router.push('/registration-success');
      } else {
        const error = await response.json();
        toast.error(
          error.message || 'ثبت نام ناموفق بود. لطفاً دوباره تلاش کنید.',
        );
        console.error('Registration error:', error);
      }
    } catch (error) {
      toast.error('خطایی رخ داد. لطفاً دوباره تلاش کنید.');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMinor = age !== null && age < 18;

  return (
    <Layout
      title="ثبت نام - آکادمی فوتبال افشین پیروانی"
      description="Register for football training programs at AP Football Academy. Choose from various programs for ages 8-30. Secure online registration with flexible payment options."
      canonical="https://ap-football.com/register"
    >
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-primary-600 to-primary-700 px-8 py-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">
                  به باشگاه افشین پیروانی بپیوندید
                </h1>
                <p className="text-primary-100">سفر خود را آغاز کنید</p>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    اطلاعات شخصی
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام *
                      </label>
                      <input
                        type="text"
                        {...register('firstName')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="نام خود را وارد کنید"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام خانوادگی *
                      </label>
                      <input
                        type="text"
                        {...register('lastName')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="نام خانوادگی خود را وارد کنید"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label
                        htmlFor="account-email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        آدرس ایمیل
                      </label>
                      <input
                        id="account-email"
                        type="email"
                        autoComplete="email"
                        spellCheck={false}
                        {...register('email')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="ایمیل (اختیاری)"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="account-phone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        شماره تلفن
                      </label>
                      <input
                        id="account-phone"
                        type="tel"
                        autoComplete="tel"
                        {...register('phone')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="شماره تلفن (اختیاری)"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 md:col-span-2">
                      برای ساخت حساب، وارد کردن ایمیل یا شماره تلفن الزامی است؛
                      می‌توانید هر دو را وارد کنید.
                    </p>
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="account-password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      رمز عبور *
                    </label>
                    <input
                      id="account-password"
                      type="password"
                      autoComplete="new-password"
                      {...register('password')}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="حداقل ۶ کاراکتر"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label
                        htmlFor="date-of-birth"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        تاریخ تولد *
                      </label>
                      <PersianDatePicker
                        id="date-of-birth"
                        autoComplete="bday"
                        required
                        value={watchedDateOfBirth ?? ''}
                        onChange={(value) =>
                          setValue('dateOfBirth', value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        ariaInvalid={Boolean(errors.dateOfBirth)}
                        ariaDescribedBy={
                          errors.dateOfBirth
                            ? 'birth-date-help birth-date-error'
                            : 'birth-date-help'
                        }
                        className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                      />
                      <p
                        id="birth-date-help"
                        className="mt-1 text-sm text-gray-500"
                      >
                        تاریخ را با تقویم شمسی و به‌شکل سال/ماه/روز وارد کنید.
                      </p>
                      {errors.dateOfBirth && (
                        <p
                          id="birth-date-error"
                          className="mt-1 text-sm text-red-600"
                        >
                          {errors.dateOfBirth.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <span className="block text-sm font-medium text-gray-700 mb-2">
                        سن محاسبه‌شده
                      </span>
                      <p
                        className="w-full min-h-12 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        aria-live="polite"
                      >
                        {age === null
                          ? 'پس از وارد کردن تاریخ تولد نمایش داده می‌شود'
                          : `${toPersianDigits(age)} سال`}
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Program Selection */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    انتخاب برنامه
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        برنامه آموزشی *
                      </label>
                      {age === null ? (
                        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                          برای نمایش برنامه‌های متناسب، ابتدا تاریخ تولد شمسی را
                          وارد کنید.
                        </div>
                      ) : isLoading ? (
                        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                          در حال بارگذاری برنامه‌ها...
                        </div>
                      ) : filteredPrograms.length > 0 ? (
                        <select
                          {...register('program')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        >
                          <option value="">برنامه را انتخاب کنید</option>
                          {filteredPrograms.map((program) => (
                            <option key={program.id} value={program.id}>
                              {program.name} - {program.price.toLocaleString()}{' '}
                              تومان ({program.duration} ماه)
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                          برنامه‌ای برای سن شما یافت نشد.
                        </div>
                      )}
                      {errors.program && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.program.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        سطح تجربه *
                      </label>
                      <select
                        {...register('experience')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      >
                        <option value="">سطح تجربه را انتخاب کنید</option>
                        <option value="beginner">
                          مبتدی - تازه شروع کرده‌ام
                        </option>
                        <option value="intermediate">
                          متوسط - کمی تجربه دارم
                        </option>
                        <option value="advanced">
                          پیشرفته - بازیکن باتجربه
                        </option>
                      </select>
                      {errors.experience && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.experience.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Parent/Guardian Information (for minors) */}
                {isMinor && (
                  <>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        اطلاعات والدین / سرپرست
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نام والدین / سرپرست *
                          </label>
                          <input
                            type="text"
                            {...register('parentName')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            placeholder="نام والدین را وارد کنید"
                          />
                          {errors.parentName && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.parentName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ایمیل والدین / سرپرست *
                          </label>
                          <input
                            type="email"
                            {...register('parentEmail')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            placeholder="ایمیل والدین را وارد کنید"
                          />
                          {errors.parentEmail && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.parentEmail.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-100" />
                  </>
                )}

                {/* Emergency Contact */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    تماس اضطراری
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نام تماس اضطراری *
                      </label>
                      <input
                        type="text"
                        {...register('emergencyContactName')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="نام را وارد کنید"
                      />
                      {errors.emergencyContactName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.emergencyContactName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شماره تلفن اضطراری *
                      </label>
                      <input
                        type="tel"
                        {...register('emergencyContact')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="شماره تلفن را وارد کنید"
                      />
                      {errors.emergencyContact && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.emergencyContact.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Medical Information */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    اطلاعات پزشکی
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      بیماری‌ها یا آلرژی‌ها
                    </label>
                    <textarea
                      {...register('medicalConditions')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="لطفاً هر گونه بیماری، آلرژی یا نیاز خاصی که مربیان باید بدانند را بنویسید..."
                    />
                    <p className="mt-1 text-sm text-gray-600">
                      این اطلاعات محرمانه بوده و فقط برای اهداف ایمنی استفاده
                      می‌شود.
                    </p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Terms and Conditions */}
                <div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        {...register('terms')}
                        className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label className="mr-3 block text-sm text-gray-900">
                        با{' '}
                        <Link
                          href="/terms"
                          className="text-primary-600 hover:text-primary-500 underline"
                        >
                          شرایط و قوانین
                        </Link>{' '}
                        و{' '}
                        <Link
                          href="/privacy"
                          className="text-primary-600 hover:text-primary-500 underline"
                        >
                          حریم خصوصی
                        </Link>{' '}
                        موافقم. می‌دانم که هزینه ثبت نام قابل استرداد نیست.
                      </label>
                    </div>
                    {errors.terms && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.terms.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-lg"
                  >
                    {isSubmitting
                      ? 'در حال پردازش...'
                      : 'تکمیل ثبت نام و پرداخت'}
                  </button>
                  <p className="mt-3 text-center text-sm text-gray-500">
                    برای تکمیل ثبت نام به صفحه پرداخت امن هدایت می‌شوید.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
