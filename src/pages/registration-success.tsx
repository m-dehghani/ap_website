import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const RegistrationSuccessPage: React.FC = () => (
  <Layout
    title="ثبت‌نام موفق - آکادمی فوتبال افشین پیروانی"
    description="ثبت‌نام شما در آکادمی فوتبال افشین پیروانی انجام شد."
    noindex
  >
    <section className="mx-auto my-12 max-w-3xl overflow-hidden rounded-lg bg-white shadow-lg">
      <div className="bg-linear-to-r from-green-500 to-green-600 px-8 py-12 text-center">
        <CheckCircleIcon className="mx-auto mb-4 h-16 w-16 text-white" />
        <h1 className="mb-2 text-3xl font-bold text-white">
          ثبت‌نام با موفقیت انجام شد
        </h1>
        <p className="text-lg text-green-100">
          به آکادمی فوتبال افشین پیروانی خوش آمدید.
        </p>
      </div>

      <div className="space-y-6 p-8 text-center">
        <p className="text-gray-700">
          برای مشاهده وضعیت ثبت‌نام، تکمیل اطلاعات پروفایل و پرداخت شهریه
          برنامه‌های خود، وارد حساب کاربری‌تان شوید.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700"
          >
            ورود به حساب کاربری
          </Link>
          <Link
            href="/programs"
            className="rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-800 hover:bg-gray-200"
          >
            مشاهده برنامه‌ها
          </Link>
          <Link
            href="/contact"
            className="rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-800 hover:bg-gray-200"
          >
            تماس با آکادمی
          </Link>
        </div>
      </div>
    </section>
  </Layout>
);

export default RegistrationSuccessPage;
