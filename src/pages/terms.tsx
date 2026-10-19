import React from 'react';
import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const TermsPage: React.FC = () => {
  return (
    <Layout
      title="قوانین و مقررات - آکادمی فوتبال افشین پیروانی"
      description="قوانین و مقررات استفاده از خدمات آکادمی فوتبال افشین پیروانی. شرایط استفاده، مسئولیت‌ها و محدودیت‌های خدمات ارائه شده."
      canonical="https://ap-football.com/terms"
      noindex={true}
    >
      <NextSeo
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'قوانین, مقررات, شرایط استفاده, خدمات',
          },
        ]}
      />

      <div className="section-padding bg-linear-to-br from-gray-50 to-gray-100">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
              <DocumentTextIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              قوانین و مقررات
            </h1>
            <p className="text-xl text-gray-600">
              شرایط استفاده از خدمات آکادمی فوتبال افشین پیروانی
            </p>
          </div>

          <div className="card-glass p-8 rounded-4xl space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                پذیرش شرایط
              </h2>
              <p className="text-gray-700">
                با استفاده از خدمات آکادمی فوتبال افشین پیروانی، شما موافقت خود
                را با این قوانین و مقررات اعلام می‌کنید.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                خدمات ما
              </h2>
              <p className="text-gray-700 mb-4">
                آکادمی فوتبال افشین پیروانی خدمات زیر را ارائه می‌دهد:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>آموزش فوتبال برای تمام سنین</li>
                <li>برگزاری کلاس‌های تخصصی</li>
                <li>مشاوره ورزشی</li>
                <li>اردوهای آموزشی</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                مسئولیت‌های شرکت‌کننده
              </h2>
              <p className="text-gray-700 mb-4">
                شرکت‌کنندگان متعهد به رعایت موارد زیر هستند:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>حضور منظم در کلاس‌ها</li>
                <li>رعایت احترام به مربیان و سایر شرکت‌کنندگان</li>
                <li>استفاده از تجهیزات مناسب</li>
                <li>پرداخت به‌موقع هزینه‌ها</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                لغو و استرداد
              </h2>
              <p className="text-gray-700">
                درخواست لغو حداقل 48 ساعت قبل از شروع دوره باید اعلام شود. بسته
                به شرایط، امکان استرداد کامل یا جزئی هزینه‌ها وجود دارد.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                محدودیت مسئولیت
              </h2>
              <p className="text-gray-700">
                آکادمی فوتبال افشین پیروانی در قبال آسیب‌هایی که ممکن است در طول
                فعالیت‌های ورزشی رخ دهد، مسئولیت محدودی دارد. توصیه می‌شود بیمه
                مناسب تهیه کنید.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">تغییرات</h2>
              <p className="text-gray-700">
                این قوانین ممکن است بدون اطلاع قبلی تغییر کند. تغییرات از طریق
                وب‌سایت اطلاع‌رسانی می‌شود.
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

export default TermsPage;
