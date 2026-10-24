import React from 'react';
import { GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';

interface AdminDashboardProps {
  admin: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin }) => {
  return (
    <AdminLayout title="پنل مدیریت">
      <NextSeo
        title="پنل مدیریت - آکادمی فوتبال AP"
        description="پنل مدیریت آکادمی فوتبال AP برای مدیریت برنامه‌ها، مربیان و دانشجویان"
        noindex
        nofollow
      />
      <div className="py-8">
        <div className="container-custom py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">پنل مدیریت</h1>
            <p className="text-xl text-gray-600">مدیریت برنامه‌ها، مربیان و دانشجویان آکادمی</p>
            <p className="text-primary-600 mt-2">خوش آمدید، {admin.firstName} {admin.lastName}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link href="/admin/shop" className="block">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-amber-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">فروشگاه</h3>
                    <p className="text-gray-600">مدیریت کالاها، سفارش‌ها و نظرات</p>
                  </div>
                  <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center text-3xl" aria-hidden="true">⚽</div>
                </div>
              </div>
            </Link>
            <Link href="/admin/programs" className="block">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-primary-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">برنامه‌های آموزشی</h3>
                    <p className="text-gray-600">مدیریت دوره‌های فوتبال</p>
                  </div>
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/coaches" className="block">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-emerald-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">مربیان</h3>
                    <p className="text-gray-600">مدیریت تیم مربیگری</p>
                  </div>
                  <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/students" className="block">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-amber-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">دانش‌آموزان</h3>
                    <p className="text-gray-600">مدیریت ثبت‌نام‌ها</p>
                  </div>
                  <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/admin/content" className="block">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-indigo-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">مدیریت محتوای سایت</h3>
                    <p className="text-gray-600">مدیریت هیرو، ویژگی‌ها، داستان‌ها، اخبار و...</p>
                  </div>
                  <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">عملیات سریع</h3>
              <div className="space-y-3">
                <Link href="/admin/programs/new" className="block p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                  <div className="flex items-center text-primary-700">
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-medium">افزودن برنامه جدید</span>
                  </div>
                </Link>
                <Link href="/admin/coaches/new" className="block p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                  <div className="flex items-center text-emerald-700">
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="font-medium">افزودن مربی جدید</span>
                  </div>
                </Link>
                <Link href="/admin/students" className="block p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                  <div className="flex items-center text-amber-700">
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="font-medium">مشاهده ثبت‌نام‌ها</span>
                  </div>
                </Link>
                <Link href="/staff/notifications" className="block p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors">
                  <div className="flex items-center text-cyan-700">
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z" />
                    </svg>
                    <span className="font-medium">ارسال پیام و اطلاعیه</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = context.req.cookies.auth_token;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const [{ jwtVerify }, { getJwtSecret }] = await Promise.all([
      import('jose'),
      import('@/lib/auth'),
    ]);
    const { payload } = await jwtVerify(token, getJwtSecret());

    if (typeof payload.userId !== 'string') {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    const { getPrisma } = await import('@/lib/db');
    const db = await getPrisma();

    const admin = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    return {
      props: {
        admin,
      },
    };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};

export default AdminDashboard;