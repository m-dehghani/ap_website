import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({
  children,
  title = 'پنل مدیریت',
}: AdminLayoutProps) {
  const router = useRouter();
  const isAdminRoute = router.pathname.startsWith('/admin');
  const isShopRoute = router.pathname.startsWith('/admin/shop');
  const { user, loading } = useAuth();

  useEffect(() => {
    const canOpenRoute =
      user?.role === 'ADMIN' || (isShopRoute && user?.role === 'SHOP_MANAGER');
    if (isAdminRoute && !loading && !canOpenRoute) {
      void router.replace(
        user?.role === 'SHOP_MANAGER' ? '/admin/shop' : '/login',
      );
    }
  }, [isAdminRoute, isShopRoute, loading, router, user?.role]);

  if (!isAdminRoute) {
    return <>{children}</>;
  }

  const canOpenRoute =
    user?.role === 'ADMIN' || (isShopRoute && user?.role === 'SHOP_MANAGER');

  if (loading || !canOpenRoute) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        role="status"
      >
        <span className="text-gray-600">در حال بررسی دسترسی...</span>
      </div>
    );
  }

  if (user?.role === 'SHOP_MANAGER' && isShopRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        <aside className="relative z-40 w-full bg-white shadow-xl lg:fixed lg:inset-y-0 lg:right-0 lg:w-64">
          <div className="border-b border-gray-200 px-6 py-5">
            <Link
              href="/admin/shop"
              className="text-lg font-bold text-slate-900"
            >
              مدیریت فروشگاه AP
            </Link>
          </div>
          <nav className="space-y-2 p-4" aria-label="مدیریت فروشگاه">
            <Link
              href="/admin/shop"
              aria-current={
                router.pathname === '/admin/shop' ? 'page' : undefined
              }
              className={`block rounded-lg px-4 py-3 font-semibold ${
                router.pathname === '/admin/shop'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              محصولات، سفارش‌ها و تنظیمات
            </Link>
            <Link
              href="/"
              className="block rounded-lg px-4 py-3 text-slate-600 hover:bg-slate-100"
            >
              مشاهده سایت
            </Link>
          </nav>
        </aside>
        <div className="lg:mr-64">
          <header className="border-b border-gray-200 bg-white px-6 py-4">
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          </header>
          <main className="p-5 lg:p-8">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="relative z-50 w-full bg-white shadow-xl lg:fixed lg:inset-y-0 lg:right-0 lg:w-64">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link
              href="/admin"
              className="flex items-center space-x-3 space-x-reverse"
            >
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">
                آکادمی فوتبال افشین پیروانی
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav
            className="flex-1 px-4 py-6 space-y-2 overflow-y-auto"
            aria-label="پنل مدیریت"
          >
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              منو اصلی
            </div>

            <Link
              href="/admin"
              aria-current={router.pathname === '/admin' ? 'page' : undefined}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                router.pathname === '/admin'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <svg
                className="w-5 h-5 ml-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              داشبورد
            </Link>

            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              مدیریت محتوا
            </div>

            <Link
              href="/admin/content"
              aria-current={
                router.pathname.startsWith('/admin/content')
                  ? 'page'
                  : undefined
              }
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                router.pathname.startsWith('/admin/content')
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <svg
                className="w-5 h-5 ml-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm9 0a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1V5zM4 14a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1v-5zm9 0a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5z"
                />
              </svg>
              مدیریت محتوای سایت
            </Link>

            <Link
              href="/admin/shop"
              aria-current={
                router.pathname.startsWith('/admin/shop') ? 'page' : undefined
              }
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                router.pathname.startsWith('/admin/shop')
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="ml-3" aria-hidden="true">
                ⚽
              </span>
              فروشگاه
            </Link>

            <Link
              href="/admin/programs"
              aria-current={
                router.pathname.startsWith('/admin/programs')
                  ? 'page'
                  : undefined
              }
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                router.pathname.startsWith('/admin/programs')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <svg
                className="w-5 h-5 ml-3"
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
              برنامه‌های آموزشی
            </Link>

            <Link
              href="/admin/coaches"
              aria-current={
                router.pathname.startsWith('/admin/coaches')
                  ? 'page'
                  : undefined
              }
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                router.pathname.startsWith('/admin/coaches')
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <svg
                className="w-5 h-5 ml-3"
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
              مربیان
            </Link>

            <Link
              href="/admin/students"
              aria-current={
                router.pathname.startsWith('/admin/students')
                  ? 'page'
                  : undefined
              }
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                router.pathname.startsWith('/admin/students')
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <svg
                className="w-5 h-5 ml-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              دانشجویان
            </Link>

            <Link
              href="/staff/notifications"
              aria-current={
                router.pathname === '/staff/notifications' ? 'page' : undefined
              }
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                router.pathname === '/staff/notifications'
                  ? 'bg-cyan-50 text-cyan-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <svg
                className="w-5 h-5 ml-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              پیام به دانش‌آموزان
            </Link>

            <Link
              href="/admin/sessions"
              aria-current={
                router.pathname.startsWith('/admin/sessions')
                  ? 'page'
                  : undefined
              }
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                router.pathname.startsWith('/admin/sessions')
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <svg
                className="w-5 h-5 ml-3"
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
              جلسات
            </Link>

            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              راهنما و پشتیبانی
            </div>

            <Link
              href="/contact"
              aria-current={router.pathname === '/contact' ? 'page' : undefined}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                router.pathname === '/contact'
                  ? 'bg-gray-50 text-gray-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <svg
                className="w-5 h-5 ml-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              تماس با آکادمی
            </Link>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Link
              href="/"
              target="_blank"
              className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              مشاهده سایت
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:mr-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                href="/"
                target="_blank"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                مشاهده سایت
              </Link>
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">مد</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
