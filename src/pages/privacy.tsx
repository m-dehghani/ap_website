import React from 'react';
import { NextSeo } from 'next-seo';
import Layout from '../components/Layout';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const PrivacyPage: React.FC = () => {
  return (
    <Layout
      title="سیاست حفظ حریم خصوصی - آکادمی فوتبال افشین پیروانی"
      description="سیاست حفظ حریم خصوصی و حمایت از اطلاعات شخصی کاربران آکادمی فوتبال افشین پیروانی. اطلاعاتی درباره جمع‌آوری، استفاده و حفاظت از داده‌ها."
      canonical="https://ap-football.com/privacy"
      noindex={true}
    >
      <NextSeo
        additionalMetaTags={[
          {
            name: 'keywords',
            content: 'حریم خصوصی, حفاظت از اطلاعات, سیاست نامه, قوانین',
          },
        ]}
      />

      <div className="section-padding bg-linear-to-br from-gray-50 to-gray-100">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
              <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              سیاست حفظ حریم خصوصی
            </h1>
            <p className="text-xl text-gray-600">
              آکادمی فوتبال افشین پیروانی متعهد به حفاظت از اطلاعات شخصی شما است
            </p>
          </div>

          <div className="card-glass p-8 rounded-4xl space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                جمع‌آوری اطلاعات
              </h2>
              <p className="text-gray-700 mb-4">
                ما اطلاعات شخصی شما را تنها برای ارائه خدمات بهتر و برقراری
                ارتباط جمع‌آوری می‌کنیم. این اطلاعات شامل:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>نام و نام خانوادگی</li>
                <li>آدرس ایمیل</li>
                <li>شماره تلفن</li>
                <li>اطلاعات پزشکی (در صورت لزوم)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                استفاده از اطلاعات
              </h2>
              <p className="text-gray-700 mb-4">
                اطلاعات شما صرفاً برای اهداف زیر استفاده می‌شود:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>ارائه خدمات آموزشی</li>
                <li>برقراری ارتباط در مورد برنامه‌های آموزشی</li>
                <li>ارسال اطلاعات مربوط به رویدادها</li>
                <li>بهبود کیفیت خدمات</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                حفاظت از اطلاعات
              </h2>
              <p className="text-gray-700">
                ما از روش‌های امنیتی مناسب برای حفاظت از اطلاعات شخصی شما
                استفاده می‌کنیم و هرگز این اطلاعات را با اشخاص ثالث به اشتراک
                نمی‌گذاریم مگر در مواردی که قانوناً ملزم باشیم.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                حقوق شما
              </h2>
              <p className="text-gray-700 mb-4">شما حق دارید:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>درخواست دسترسی به اطلاعات شخصی خود</li>
                <li>درخواست اصلاح اطلاعات نادرست</li>
                <li>درخواست حذف اطلاعات شخصی</li>
                <li>انصراف از دریافت ایمیل‌های تبلیغاتی</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                تماس با ما
              </h2>
              <p className="text-gray-700">
                برای هرگونه سوال در مورد سیاست حفظ حریم خصوصی، می‌توانید با ما
                تماس بگیرید:
              </p>
              <p className="text-gray-700 mt-4">
                ایمیل: privacy@ap-football.com
                <br />
                تلفن: 021-12345678
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">تغییرات</h2>
              <p className="text-gray-700">
                این سیاست ممکن است به‌روزرسانی شود. تغییرات مهم از طریق ایمیل یا
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

export default PrivacyPage;
