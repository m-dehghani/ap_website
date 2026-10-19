import React from 'react';
import { APP_CONFIG } from '@/constants/app';
import Layout from '../components/Layout';
import PageHero from '../components/PageHero';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

const ContactPage: React.FC = () => {
  const handleContactSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = [formData.get('firstName'), formData.get('lastName')]
      .filter(
        (part): part is string =>
          typeof part === 'string' && Boolean(part.trim()),
      )
      .join(' ');
    const subject = encodeURIComponent(`پیام از ${name}`);
    const body = encodeURIComponent(
      [
        `نام: ${name}`,
        `ایمیل: ${formData.get('email') ?? ''}`,
        `تلفن: ${formData.get('phone') ?? ''}`,
        '',
        String(formData.get('message') ?? ''),
      ].join('\n'),
    );

    window.location.href = `mailto:${APP_CONFIG.email}?subject=${subject}&body=${body}`;
  };

  return (
    <Layout
      title="تماس با ما - آکادمی فوتبال AP"
      description="با آکادمی فوتبال AP در تماس باشید. آدرس، شماره تلفن، ایمیل و ساعات کاری آکادمی."
      canonical="https://ap-football.com/contact"
      openGraph={{
        title: 'تماس با ما - آکادمی فوتبال AP',
        description: 'با آکادمی فوتبال AP در تماس باشید',
        images: [
          {
            url: 'https://ap-football.com/images/contact-og.jpg',
            width: 1200,
            height: 630,
            alt: 'تماس با آکادمی فوتبال AP',
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

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card-glass p-8 rounded-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                پیام خود را ارسال کنید
              </h2>
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      نام
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      autoComplete="given-name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="نام شما…"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      نام خانوادگی
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      autoComplete="family-name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      placeholder="نام خانوادگی شما…"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    ایمیل
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    spellCheck={false}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    شماره تلفن
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    autoComplete="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="شماره تلفن شما…"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    پیام
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    placeholder="پیام خود را بنویسید…"
                  />
                </div>
                <p className="text-sm text-gray-600" aria-live="polite">
                  با ارسال پیام، برنامه ایمیل شما برای ارسال آن به {APP_CONFIG.email} باز می‌شود.
                </p>
                <button
                  type="submit"
                  className="w-full btn btn-primary"
                >
                  ارسال پیام
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
                      <p className="text-gray-700">{APP_CONFIG.address}، {APP_CONFIG.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <ClockIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">ساعات کاری</h3>
                      <p className="text-gray-600">شنبه تا چهارشنبه: 8:00 - 22:00</p>
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
                <div className="bg-linear-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-2xl min-h-64 p-6 flex flex-col items-center justify-center gap-3 text-center">
                  <MapPinIcon className="w-10 h-10 text-primary-700" aria-hidden="true" />
                  <p className="text-gray-800 font-medium">{APP_CONFIG.address}، {APP_CONFIG.city}</p>
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
