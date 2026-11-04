import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  ComputerDesktopIcon,
  Cog6ToothIcon,
  MoonIcon,
  ShoppingBagIcon,
  SunIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { NAVIGATION } from '@/constants/app';
import { useAuth } from '@/hooks/useAuth';
import { readShopCart } from '@/lib/shop-cart';
import { SiteInfoViewModel } from '@/types/viewModels/site';
import ThemePreferenceControl from '@/components/ui/ThemePreferenceControl';
import { useThemePreference } from '@/hooks/useThemePreference';
import ProfileAvatar from '@/components/ProfileAvatar';

interface HeaderProps {
  site?: SiteInfoViewModel | null;
}

const Header: React.FC<HeaderProps> = ({ site }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const restoreMobileMenuFocusRef = useRef(false);
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { preference } = useThemePreference();

  const navigation = NAVIGATION.main;

  useEffect(() => {
    const closeMenu = () => {
      setIsMenuOpen(false);
      setIsProfileMenuOpen(false);
    };
    router.events.on('routeChangeStart', closeMenu);
    return () => router.events.off('routeChangeStart', closeMenu);
  }, [router.events]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const menu = mobileMenuRef.current;
    if (!menu) return;

    const getMenuControls = () =>
      Array.from(
        menu.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((control) => !control.closest('[hidden], [aria-hidden="true"]'));

    getMenuControls()[0]?.focus();

    const handleMenuKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        restoreMobileMenuFocusRef.current = true;
        setIsMenuOpen(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const controls = getMenuControls();
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;

      if (
        event.shiftKey &&
        (document.activeElement === first || !menu.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !menu.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    menu.addEventListener('keydown', handleMenuKeyDown);
    return () => menu.removeEventListener('keydown', handleMenuKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen || !restoreMobileMenuFocusRef.current) return;
    restoreMobileMenuFocusRef.current = false;
    mobileMenuButtonRef.current?.focus();
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !profileMenuRef.current?.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsProfileMenuOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isProfileMenuOpen]);

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
    setIsProfileMenuOpen(false);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const profileHref = user
    ? {
        ADMIN: '/admin',
        SHOP_MANAGER: '/admin/shop',
        COACH: '/coach/dashboard',
        STUDENT: '/student/dashboard',
      }[user.role]
    : '/login';
  const ThemeIcon =
    preference === 'dark'
      ? MoonIcon
      : preference === 'light'
        ? SunIcon
        : ComputerDesktopIcon;

  return (
    <header className="site-header sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl">
      <a href="#main-content" className="skip-to-content">
        رفتن به محتوای اصلی
      </a>
      <div className="container-custom">
        <div className="flex items-center justify-between gap-2 py-3 md:py-4">
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            {site?.logoUrl ? (
              <Image
                src={site.logoUrl}
                alt="لوگوی آکادمی فوتبال AP"
                width={44}
                height={44}
                className="size-10 shrink-0 rounded-xl object-contain sm:size-11"
              />
            ) : (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-700 text-sm font-extrabold text-white shadow-sm sm:size-11">
                AP
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight text-navy-900 sm:text-base">
                {site?.name ?? 'آکادمی فوتبال AP'}
              </p>
              <p className="hidden text-xs font-medium text-slate-500 2xl:block">
                {site?.tagline ?? 'AP Football Academy'}
              </p>
            </div>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0 lg:flex" aria-label="منوی اصلی">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-xl px-2 py-2 text-sm font-semibold transition-colors 2xl:px-2.5 ${
                  item.href === '/shop'
                    ? 'bg-primary-600 text-white shadow-sm hover:bg-primary-700'
                    : isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-primary-50 hover:text-primary-700'
                }`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.href === '/shop' && (
                  <ShoppingBagIcon className="h-4 w-4" aria-hidden="true" />
                )}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 lg:gap-3">
            <details className="relative hidden lg:block">
              <summary
                aria-label="انتخاب پوسته سایت"
                title="انتخاب پوسته سایت"
                className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-primary-600 [&::-webkit-details-marker]:hidden"
              >
                <ThemeIcon className="h-5 w-5" aria-hidden="true" />
              </summary>
              <div className="absolute left-0 top-full z-[60] mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                <p className="mb-2 px-1 text-xs font-semibold text-slate-500">
                  پوسته سایت
                </p>
                <ThemePreferenceControl onSelection={closeMenus} />
              </div>
            </details>
            <Link
              href="/shop/cart"
              className="relative hidden rounded-xl p-2 text-slate-700 transition-colors hover:bg-primary-50 hover:text-primary-700 lg:block"
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
              <div className="hidden items-center gap-2 lg:flex">
                <Link href="/register" className="btn btn-secondary px-3 py-2 text-sm 2xl:px-4">
                  ثبت نام
                </Link>
                <Link href="/login" className="btn btn-primary px-3 py-2 text-sm 2xl:px-4">
                  ورود
                </Link>
              </div>
            ) : !loading && user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full border border-primary-100 bg-white py-1 pl-2 pr-1 text-slate-700 transition-colors hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-primary-600"
                  aria-label="باز کردن منوی حساب کاربری"
                  aria-expanded={isProfileMenuOpen}
                  aria-controls="profile-menu"
                >
                  <ProfileAvatar
                    image={user.image}
                    initials={`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
                    size={36}
                  />
                  <span className="hidden max-w-28 truncate text-sm font-semibold 2xl:inline">
                    {user.firstName}
                  </span>
                  <ChevronDownIcon className="hidden h-4 w-4 text-slate-500 2xl:block" />
                </button>
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      id="profile-menu"
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="fixed left-4 top-16 z-50 max-h-[calc(100dvh-5rem)] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xl lg:absolute lg:left-auto lg:right-0 lg:top-full lg:mt-3 lg:max-h-none lg:w-72"
                    >
                      <div className="border-b border-slate-100 px-3 pb-3">
                        <p className="font-bold text-slate-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {user.email ?? user.phone ?? ''}
                        </p>
                      </div>
                      <div className="space-y-1 py-2">
                        <Link
                          href={profileHref}
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-700"
                        >
                          <UserIcon className="h-5 w-5" />
                          پروفایل من
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-700"
                        >
                          <Cog6ToothIcon className="h-5 w-5" />
                          تنظیمات
                        </Link>
                        {user.role === 'ADMIN' && (
                          <Link
                            href="/admin/settings/branding"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-primary-50 hover:text-primary-700"
                          >
                            <Cog6ToothIcon className="h-5 w-5" aria-hidden="true" />
                            تنظیمات برند سایت
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-slate-100 pt-3">
                        <p className="mb-2 px-1 text-xs font-semibold text-slate-500">
                          پوسته سایت
                        </p>
                        <ThemePreferenceControl onSelection={closeMenus} />
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-3 flex w-full items-center gap-3 rounded-xl border-t border-slate-100 px-3 pt-3 text-sm font-semibold text-red-700 hover:text-red-800"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        خروج از حساب
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden items-center gap-3 lg:flex">
                <div className="animate-pulse bg-gray-200 rounded h-8 w-20"></div>
                <div className="animate-pulse bg-gray-200 rounded h-8 w-24"></div>
              </div>
            )}

            <Link
              href="/shop/cart"
              className="relative rounded-xl p-2 text-slate-700 transition-colors hover:bg-primary-50 hover:text-primary-700 lg:hidden"
              aria-label={`سبد خرید، ${cartCount} کالا`}
            >
              <ShoppingBagIcon className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary-600 px-1 text-center text-xs text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              ref={mobileMenuButtonRef}
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-700 hover:bg-primary-50 hover:text-primary-700 lg:hidden"
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
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-slate-200 lg:hidden"
              id="mobile-navigation"
            >
              <nav className="flex flex-col gap-1 py-4" aria-label="منوی اصلی">
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
                <div className="mt-2 border-t border-slate-200 px-4 pt-4">
                  <p className="mb-2 text-xs font-semibold text-slate-500">
                    پوسته سایت
                  </p>
                  <ThemePreferenceControl onSelection={closeMenus} />
                </div>
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
                ) : loading ? (
                  <div className="animate-pulse space-y-2 mt-2">
                    <div className="bg-gray-200 rounded h-10"></div>
                    <div className="bg-gray-200 rounded h-10"></div>
                  </div>
                ) : null}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;