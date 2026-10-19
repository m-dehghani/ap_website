import React from 'react';
import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';
import { CakeIcon } from '@heroicons/react/24/outline';

const CookiesPage: React.FC = () => {
  return (
    <Layout
      title="سیاست کوکی‌ها - آکادمی فوتبال AP"
      description="سیاست استفاده از کوکی‌ها در وب‌سایت آکادمی فوتبال AP"
      canonical="https://ap-football.com/cookies"
      noindex={true}
    >
      <NextSeo
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'کوکی, سیاست کوکی, وب‌سایت, ردیابی',
          },
        ]}
      />

      <div className="section-padding bg-linear-to-br from-gray-50 to-gray-100">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
              <CakeIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              سیاست کوکی‌ها
            </h1>
            <p className="text-xl text-gray-600">
              چگونه از کوکی‌ها در وب‌سایت خود استفاده می‌کنیم
            </p>
          </div>

          <div className="card-glass p-8 rounded-4xl space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                کوکی چیست؟
              </h2>
              <p className="text-gray-700">
                کوکی فایل‌های کوچک متنی هستند که در مرورگر شما ذخیره می‌شوند تا
                تجربه کاربری بهتری داشته باشید.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                انواع کوکی‌ها
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    کوکی‌های ضروری
                  </h3>
                  <p className="text-gray-700">
                    این کوکی‌ها برای عملکرد صحیح وب‌سایت ضروری هستند و غیرفعال
                    نمی‌شوند.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    کوکی‌های تحلیلی
                  </h3>
                  <p className="text-gray-700">
                    برای بهبود عملکرد وب‌سایت و درک رفتار کاربران استفاده
                    می‌شوند.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    کوکی‌های تبلیغاتی
                  </h3>
                  <p className="text-gray-700">
                    برای نمایش تبلیغات مرتبط و شخصی‌سازی تجربه کاربری استفاده
                    می‌شوند.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                مدیریت کوکی‌ها
              </h2>
              <p className="text-gray-700 mb-4">
                شما می‌توانید کوکی‌ها را از طریق تنظیمات مرورگر خود مدیریت کنید:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>حذف کوکی‌های موجود</li>
                <li>جلوگیری از ذخیره کوکی‌های جدید</li>
                <li>مدیریت کوکی‌ها برای سایت‌های خاص</li>
                <li>دریافت اطلاع‌رسانی هنگام دریافت کوکی</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                کوکی‌های شخص ثالث
              </h2>
              <p className="text-gray-700">
                ممکن است از خدمات شخص ثالث مانند Google Analytics استفاده کنیم
                که کوکی‌های خود را دارند.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                تماس با ما
              </h2>
              <p className="text-gray-700">
                برای سوالات مربوط به کوکی‌ها، با ما تماس بگیرید:
              </p>
              <p className="text-gray-700 mt-4">
                ایمیل: info@ap-football.com
                <br />
                تلفن: 021-12345678
              </p>
            </section>

            <div className="border-t border-gray-200 pt-8">
              <p className="text-sm text-gray-500 text-center">
                آخرین به‌روزرسانی: آذر 1402
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CookiesPage;
