import React from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { useEffect } from 'react';

interface CoachDashboardProps {
  coach: any;
}

const CoachDashboardPage: React.FC<CoachDashboardProps> = ({ coach }) => {
  const router = useRouter();

  useEffect(() => {
    // Check auth on client side
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
        } else {
          const data = await response.json();
          if (data.user.role !== 'COACH') {
            router.push('/login');
          }
        }
      } catch {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const programs = coach.programs || [];
  const sessions = coach.sessions || [];

  return (
    <Layout
      title="پنل مربی - آکادمی فوتبال افشین پیروانی"
      description="پنل مدیریت اطلاعات مربی"
      noindex={true}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">پنل مربی</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/staff/notifications"
                  className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-100"
                >
                  ارسال پیام
                </Link>
                <span className="text-gray-700">
                  {coach.firstName} {coach.lastName}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="bg-linear-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-lg">
              <h2 className="text-white text-lg font-semibold">
                اطلاعات پروفایل مربی
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  نام
                </label>
                <p className="text-gray-900 mt-1">
                  {coach.firstName} {coach.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  ایمیل
                </label>
                <p className="text-gray-900 mt-1">{coach.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  تلفن
                </label>
                <p className="text-gray-900 mt-1">{coach.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  تخصص
                </label>
                <p className="text-gray-900 mt-1">{coach.specialization}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">
                  عنوان
                </label>
                <p className="text-gray-900 mt-1">
                  {coach.title || 'ثبت نشده'}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">
                  تجربه
                </label>
                <p className="text-gray-900 mt-1">{coach.experience} سال</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    برنامه‌های فعال
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {programs.filter((p: any) => p.isActive).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    دانش‌آموزان
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {coach.studentsCount || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    جلسات پیش‌رو
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      sessions.filter((s: any) => s.status === 'SCHEDULED')
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888a1 1 0 00.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">امتیاز</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {coach.rating || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Programs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="bg-linear-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h2 className="text-white text-lg font-semibold">
                برنامه‌های آموزشی من
              </h2>
            </div>
            <div className="p-6">
              {programs.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    هیچ برنامه‌ای ندارید
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    برای شروع، یک برنامه آموزشی جدید ایجاد کنید.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {programs.map((program: any) => (
                    <div
                      key={program.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {program.name}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {program.sessionCount} جلسه • {program.duration} ماه
                            • {program.price.toLocaleString()} تومان
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            حداکثر {program.maxStudents} دانش‌آموز
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              program.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {program.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-linear-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h2 className="text-white text-lg font-semibold">جلسات پیش‌رو</h2>
            </div>
            <div className="p-6">
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    هیچ جلسه‌ای برنامه‌ریزی نشده
                  </h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions
                    .filter((s: any) => s.status === 'SCHEDULED')
                    .slice(0, 5)
                    .map((session: any) => (
                      <div
                        key={session.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {session.name}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              {new Date(session.date).toLocaleDateString(
                                'fa-IR',
                              )}{' '}
                              • {session.duration} دقیقه
                            </p>
                            <p className="text-gray-500 text-sm mt-1">
                              {session.location} • ظرفیت: {session.maxCapacity}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { getSession } = await import('@/lib/auth');
  const session = await getSession(context.req);
  if (
    !session ||
    session.role !== 'COACH' ||
    session.source !== 'coach'
  ) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const { getPrisma } = await import('@/lib/db');
  const db = await getPrisma();
  const coach = await db.coach.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      specialization: true,
      title: true,
      experience: true,
      studentsCount: true,
      rating: true,
      programs: {
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          name: true,
          sessionCount: true,
          duration: true,
          price: true,
          maxStudents: true,
          isActive: true,
        },
      },
      sessions: {
        where: { status: 'SCHEDULED' },
        orderBy: { date: 'asc' },
        take: 10,
        select: {
          id: true,
          name: true,
          date: true,
          duration: true,
          location: true,
          maxCapacity: true,
          status: true,
        },
      },
    },
  });

  if (!coach) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {
      coach: {
        ...coach,
        sessions: coach.sessions.map((session) => ({
          ...session,
          date: session.date.toISOString(),
        })),
      },
    },
  };
};

export default CoachDashboardPage;
