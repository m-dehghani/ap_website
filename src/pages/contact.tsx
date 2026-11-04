import React, { useEffect, useRef, useState } from 'react';
import { APP_CONFIG } from '@/constants/app';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ContactPage: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [failureMessage, setFailureMessage] = useState('');
  const [mailtoFallback, setMailtoFallback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const firstInvalidField = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'message',
    ].find((name) => fieldErrors[name]?.length);
    if (!firstInvalidField) return;

    const field = formRef.current?.elements.namedItem(firstInvalidField);
    if (field instanceof HTMLElement) field.focus();
  }, [fieldErrors]);

  const handleContactSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = [formData.get('firstName'), formData.get('lastName')]
      .filter(
        (part): part is string =>
          typeof part === 'string' && Boolean(part.trim()),
      )
      .join(' ');
    const values = {
      firstName: String(formData.get('firstName') ?? ''),
      lastName: String(formData.get('lastName') ?? ''),
      email: String(formData.get('email') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      message: String(formData.get('message') ?? ''),
      company: String(formData.get('company') ?? ''),
    };
    const mailtoBody = encodeURIComponent(
      [
        `نام: ${name}`,
        `ایمیل: ${values.email}`,
        `تلفن: ${values.phone}`,
        '',
        values.message,
      ].join('\n'),
    );

    setFieldErrors({});
    setStatusMessage('');
    setFailureMessage('');
    setMailtoFallback('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (response.ok) {
        setStatusMessage(result.message ?? 'پیام شما با موفقیت ثبت شد.');
        form.reset();
      } else if (response.status === 400 && result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
        setFailureMessage(result.message ?? 'لطفاً اطلاعات واردشده را بررسی کنید.');
      } else {
        setFailureMessage('ارسال پیام از طریق سامانه ناموفق بود.');
        setMailtoFallback(
          `mailto:${APP_CONFIG.email}?subject=${encodeURIComponent(`پیام از ${name}`)}&body=${mailtoBody}`,
        );
      }
    } catch {
      setFailureMessage('ارسال پیام از طریق سامانه ناموفق بود.');
      setMailtoFallback(
        `mailto:${APP_CONFIG.email}?subject=${encodeURIComponent(`پیام از ${name}`)}&body=${mailtoBody}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout
      title="تماس با ما - آکادمی فوتبال افشین پیروانی"
      description="با آکادمی فوتبال افشین پیروانی در تماس باشید. آدرس، شماره تلفن، ایمیل و ساعات کاری آکادمی."
      canonical="https://afshin-football.com/contact"
      openGraph={{
        title: 'تماس با ما - آکادمی فوتبال افشین پیروانی',
        description: 'با آکادمی فوتبال افشین پیروانی در تماس باشید',
        images: [
          {
            url: 'https://afshin-football.com/images/contact-og.jpg',
            width: 1200,
            height: 630,
            alt: 'تماس با آکادمی فوتبال افشین پیروانی',
          },
        ],
      }}
    >
      <PageHero
        title="تماس با ما"
        description="برای کسب اطلاعات بیشتر، ثبت نام یا هر سوال دیگری با ما در تماس باشید"
        badge="ارتباط با آکادمی"
      />

      <div className="section-padding bg-linear-to-br from-gray-50 to-gray-100">
        <div className="container-custom">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] lg:gap-8">
            {/* Contact Form */}
            <div className="card-glass p-8 rounded-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                پیام خود را ارسال کنید
              </h2>
              <form
                ref={formRef}
                className="space-y-6"
                onSubmit={handleContactSubmit}
                noValidate
              >
                {statusMessage && (
                  <p
                    className="rounded-lg bg-emerald-50 p-4 text-emerald-800"
                    role="status"
                    aria-live="polite"
                  >
                    {statusMessage}
                  </p>
                )}
                {failureMessage && (
                  <div className="rounded-lg bg-red-50 p-4 text-red-800" role="alert">
                    <p>{failureMessage}</p>
                    {mailtoFallback && (
                      <a className="mt-2 inline-block underline" href={mailtoFallback}>
                        ارسال با ایمیل
                      </a>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      نام
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      autoComplete="given-name"
                      required
                      aria-invalid={Boolean(fieldErrors.firstName?.length)}
                      aria-describedby={
                        fieldErrors.firstName?.length ? 'firstName-error' : undefined
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="نام شما…"
                    />
                    {fieldErrors.firstName?.map((error) => (
                      <p id="firstName-error" key={error} className="mt-1 text-sm text-red-700">
                        {error}
                      </p>
                    ))}
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      نام خانوادگی
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      autoComplete="family-name"
                      required
                      aria-invalid={Boolean(fieldErrors.lastName?.length)}
                      aria-describedby={
                        fieldErrors.lastName?.length ? 'lastName-error' : undefined
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="نام خانوادگی شما…"
                    />
                    {fieldErrors.lastName?.map((error) => (
                      <p id="lastName-error" key={error} className="mt-1 text-sm text-red-700">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    ایمیل
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    spellCheck={false}
                    autoCapitalize="none"
                    autoCorrect="off"
                    required
                    aria-invalid={Boolean(fieldErrors.email?.length)}
                    aria-describedby={
                      fieldErrors.email?.length ? 'email-error' : undefined
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="name@example.com"
                  />
                  {fieldErrors.email?.map((error) => (
                    <p id="email-error" key={error} className="mt-1 text-sm text-red-700">
                      {error}
                    </p>
                  ))}
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    شماره تلفن
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    autoComplete="tel"
                    spellCheck={false}
                    aria-invalid={Boolean(fieldErrors.phone?.length)}
                    aria-describedby={
                      fieldErrors.phone?.length ? 'phone-error' : undefined
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="شماره تلفن شما…"
                  />
                  {fieldErrors.phone?.map((error) => (
                    <p id="phone-error" key={error} className="mt-1 text-sm text-red-700">
                      {error}
                    </p>
                  ))}
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    پیام
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    aria-invalid={Boolean(fieldErrors.message?.length)}
                    aria-describedby={
                      fieldErrors.message?.length ? 'message-error' : undefined
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="پیام خود را بنویسید…"
                  />
                  {fieldErrors.message?.map((error) => (
                    <p id="message-error" key={error} className="mt-1 text-sm text-red-700">
                      {error}
                    </p>
                  ))}
                </div>
                <div
                  aria-hidden="true"
                  className="visually-hidden"
                >
                  <label htmlFor="company">نام شرکت</label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full btn btn-primary"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner />
                      در حال ارسال…
                    </>
                  ) : (
                    'ارسال پیام'
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="card-glass p-8 rounded-4xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  اطلاعات تماس
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <PhoneIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">تلفن</h3>
                      <a
                        href={`tel:${APP_CONFIG.phone.replace(/[^\d+]/g, '')}`}
                        className="text-gray-700 hover:text-primary-700 hover:underline"
                      >
                        {APP_CONFIG.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                      <EnvelopeIcon className="w-6 h-6 text-secondary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">ایمیل</h3>
                      <a
                        href={`mailto:${APP_CONFIG.email}`}
                        className="text-gray-700 hover:text-primary-700 hover:underline"
                      >
                        {APP_CONFIG.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                      <MapPinIcon className="w-6 h-6 text-accent-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">آدرس</h3>
                      <p className="text-gray-700">
                        {APP_CONFIG.address}، {APP_CONFIG.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <ClockIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        ساعات کاری
                      </h3>
                      <p className="text-gray-600">
                        شنبه تا چهارشنبه: 8:00 - 22:00
                      </p>
                      <p className="text-gray-600">پنج‌شنبه: 8:00 - 18:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="card-glass p-8 rounded-4xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  موقعیت مکانی
                </h2>
                <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
                  <MapPinIcon
                    className="w-10 h-10 text-primary-700"
                    aria-hidden="true"
                  />
                  <p className="text-gray-800 font-medium">
                    {APP_CONFIG.address}، {APP_CONFIG.city}
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(`${APP_CONFIG.address}, ${APP_CONFIG.city}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                  >
                    جست‌وجو در نقشه
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
