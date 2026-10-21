import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon, UserCircleIcon, ArrowRightOnRectangleIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { NAVIGATION } from '@/constants/app';
import { useAuth } from '@/hooks/useAuth';
import { readShopCart } from '@/lib/shop-cart';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const navigation = NAVIGATION.main;

  useEffect(() => {
    const closeMenu = () => setIsMenuOpen(false);
    router.events.on('routeChangeStart', closeMenu);
    return () => router.events.off('routeChangeStart', closeMenu);
  }, [router.events]);

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(readShopCart().reduce((count, item) => count + item.quantity, 0));
    };
    updateCartCount();
    window.addEventListener('ap-shop-storage', updateCartCount);
    return () => window.removeEventListener('ap-shop-storage', updateCartCount);
  }, []);

  const isActive = (href: string) =>
    href === '/'
      ? router.pathname === '/'
      : router.pathname === href || router.pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-sm">
      <a href="#main-content" className="skip-to-content">
        رفتن به محتوای اصلی
      </a>
      <div className="container-custom">
        <div className="flex items-center justify-between gap-4 py-3 md:py-4">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-primary-600 to-primary-800 text-lg font-bold text-white shadow-md">
              AP
            </div>
            <div>
              <p className="text-base font-bold text-navy-900 leading-tight">
                آکادمی فوتبال
              </p>
              <p className="text-xs font-medium text-slate-500">
                AP Football Academy
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-primary-700'
                }`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/shop/cart"
              className="relative rounded-lg p-2 text-slate-700 hover:bg-slate-100"
              aria-label={`سبد خرید، ${cartCount} کالا`}
            >
              <ShoppingBagIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary-600 px-1 text-center text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            {!loading && !user ? (
              <>
                <Link href="/contact" className="btn btn-outline px-4 py-2 text-sm">
                  مشاوره رایگان
                </Link>
                <Link href="/register" className="btn btn-secondary px-5 py-2.5 text-sm">
                  ثبت نام
                </Link>
                <Link href="/login" className="btn btn-primary px-5 py-2.5 text-sm">
                  ورود
                </Link>
              </>
            ) : !loading && user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="btn btn-outline px-4 py-2 text-sm">
                    پنل مدیریت
                  </Link>
                )}
                {user.role === 'SHOP_MANAGER' && (
                  <Link href="/admin/shop" className="btn btn-outline px-4 py-2 text-sm">
                    مدیریت فروشگاه
                  </Link>
                )}
                {user.role === 'COACH' && (
                  <Link href="/coach/dashboard" className="btn btn-outline px-4 py-2 text-sm">
                    پنل مربی
                  </Link>
                )}
                {user.role === 'STUDENT' && (
                  <Link href="/student/dashboard" className="btn btn-outline px-4 py-2 text-sm">
                    پنل دانش‌آموز
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-3 border-r border-gray-200">
                  <UserCircleIcon className="h-6 w-6 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>خروج</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="animate-pulse bg-gray-200 rounded h-8 w-20"></div>
                <div className="animate-pulse bg-gray-200 rounded h-8 w-24"></div>
                            </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden rounded-xl border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-50"
            aria-label={isMenuOpen ? 'بستن منوی اصلی' : 'باز کردن منوی اصلی'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-slate-200 lg:hidden"
              id="mobile-navigation"
            >
              <nav className="flex flex-col gap-1 py-4">
                {navigation.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`rounded-lg px-4 py-3 font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/shop/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
                >
                  سبد خرید ({cartCount})
                </Link>
                {!loading && !user ? (
                  <>
                    <Link
                      href="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="btn btn-secondary mt-2 w-full text-center"
                    >
                      ثبت نام
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="btn btn-primary mt-2 w-full text-center"
                    >
                      ورود
                    </Link>
                  </>
                ) : !loading && user ? (
                  <>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="btn btn-outline mt-2 w-full text-center"
                      >
                        پنل مدیریت
                      </Link>
                    )}
                    {user.role === 'SHOP_MANAGER' && (
                      <Link
                        href="/admin/shop"
                        onClick={() => setIsMenuOpen(false)}
                        className="btn btn-outline mt-2 w-full text-center"
                      >
                        مدیریت فروشگاه
                      </Link>
                    )}
                    {user.role === 'COACH' && (
                      <Link
                        href="/coach/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="btn btn-outline mt-2 w-full text-center"
                      >
                        پنل مربی
                      </Link>
                    )}
                    {user.role === 'STUDENT' && (
                      <Link
                        href="/student/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="btn btn-outline mt-2 w-full text-center"
                      >
                        پنل دانش‌آموز
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="btn btn-outline mt-2 w-full text-center text-red-600 border-red-300 hover:bg-red-50"
                    >
                      خروج
                    </button>
                  </>
                ) : (
                  <div className="animate-pulse space-y-2 mt-2">
                    <div className="bg-gray-200 rounded h-10"></div>
                    <div className="bg-gray-200 rounded h-10"></div>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
