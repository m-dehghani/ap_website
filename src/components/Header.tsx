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
  HomeIcon,
  MoonIcon,
  BookOpenIcon,
  MegaphoneIcon,
  ShoppingBagIcon,
  SunIcon,
  UserGroupIcon,
  UserIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { NAVIGATION } from '@/constants/app';
import { useAuth } from '@/hooks/useAuth';
import { readShopCart } from '@/lib/shop-cart';
import { SiteInfoViewModel } from '@/types/viewModels/site';
import ThemePreferenceControl from '@/components/ui/ThemePreferenceControl';
import { useThemePreference } from '@/hooks/useThemePreference';
import ProfileAvatar from '@/components/ProfileAvatar';

const navigationIcons = {
  '/': HomeIcon,
  '/shop': ShoppingBagIcon,
  '/programs': BookOpenIcon,
  '/coaches': UserGroupIcon,
  '/about': AcademicCapIcon,
  '/news': MegaphoneIcon,
  '/testimonials': ChatBubbleLeftRightIcon,
  '/contact': EnvelopeIcon,
} satisfies Record<(typeof NAVIGATION.main)[number]['href'], typeof HomeIcon>;

interface HeaderProps {
  site?: SiteInfoViewModel | null;
}

const Header: React.FC<HeaderProps> = ({ site }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const restoreMobileMenuFocusRef = useRef(false);
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { preference } = useThemePreference();

  const navigation = NAVIGATION.main;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  const brandName =
    site?.name === 'آکادمی فوتبال افشین پیروانی'
      ? 'افشین پیروانی'
      : site?.name ?? 'افشین پیروانی';

  return (
    <header
      className={`site-header sticky top-0 z-50 transition-all duration-300 ease-out ${
        isScrolled
          ? 'bg-white/95 shadow-md border-b border-slate-200/50 py-2'
          : 'bg-white/90 shadow-sm border-b border-slate-200/70 py-3 md:py-4'
      }`}
    >
      <a href="#main-content" className="skip-to-content">
        رفتن به محتوای اصلی
      </a>
      <div className="container-custom">
        <div className="flex items-center justify-between gap-2 py-3 md:py-4">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 sm:gap-3 group"
            aria-label="برو به صفحه اصلی"
          >
            {site?.logoUrl ? (
              <Image
                src={site.logoUrl}
                alt="لوگوی آکادمی فوتبال AP"
                width={44}
                height={44}
                className="size-10 shrink-0 rounded-xl object-contain sm:size-11 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105"
              />
            ) : (
              <motion.span
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary-600 to-primary-700 text-sm font-extrabold text-white shadow-lg sm:size-11 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
              >
                AP
              </motion.span>
            )}
            <div className="min-w-0">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-32 truncate text-base font-extrabold leading-tight bg-gradient-to-r from-navy-900 via-primary-700 to-primary-600 bg-clip-text text-transparent sm:text-lg"
                title={brandName}
              >
                {brandName}
              </motion.p>
            </div>
          </Link>

          <nav className="hidden min-w-0 flex-1 flex-nowrap items-center justify-center gap-2 2xl:flex" aria-label="منوی اصلی">
            {navigation.map((item) => {
              const IconComponent = navigationIcons[item.href];
              const isShop = item.href === '/shop';
              const isActivePage = isActive(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-xl px-1 py-2 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 2xl:min-w-0 2xl:justify-start 2xl:px-2 ${
                    isShop
                      ? 'bg-secondary-500 text-white shadow-sm hover:bg-secondary-600 hover:shadow-lg'
                      : isActivePage
                        ? isScrolled
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-primary-50 text-primary-700'
                        : isScrolled
                          ? 'text-slate-700 hover:bg-primary-50 hover:text-primary-700 hover:shadow-md'
                          : 'text-slate-600 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                  aria-current={isActivePage ? 'page' : undefined}
                  aria-label={item.label}
                  title={item.label}
                >
                  <IconComponent
                    className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-110 group-focus-visible:scale-110"
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
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
                <Link
                  href="/register"
                  className="btn btn-secondary min-h-11 min-w-11 justify-center px-2 py-2 text-sm 2xl:min-w-0 2xl:px-4"
                  aria-label="ثبت نام"
                  title="ثبت نام"
                >
                  <UserIcon className="h-5 w-5 2xl:hidden" aria-hidden="true" />
                  <span className="hidden 2xl:inline">ثبت نام</span>
                </Link>
                <Link
                  href="/login"
                  className="btn btn-primary min-h-11 min-w-11 justify-center px-2 py-2 text-sm 2xl:min-w-0 2xl:px-4"
                  aria-label="ورود"
                  title="ورود"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 2xl:hidden" aria-hidden="true" />
                  <span className="hidden 2xl:inline">ورود</span>
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
              className="rounded-xl border border-slate-200 p-2.5 text-slate-700 hover:bg-primary-50 hover:text-primary-700 2xl:hidden"
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
              className="overflow-hidden border-t border-slate-200 2xl:hidden"
              id="mobile-navigation"
            >
              <nav className="flex flex-col gap-1 py-4" aria-label="منوی اصلی">
                {navigation.map((item) => {
                  const IconComponent = navigationIcons[item.href];
                  const isShop = item.href === '/shop';
                  const isActivePage = isActive(item.href);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-base font-semibold transition-all duration-300 ${
                        isShop
                          ? 'bg-secondary-500 text-white shadow-sm hover:bg-secondary-600'
                          : isActivePage
                            ? isScrolled
                              ? 'bg-primary-600 text-white shadow-sm'
                              : 'bg-primary-50 text-primary-700'
                            : isScrolled
                              ? 'text-slate-700 hover:bg-primary-50 hover:text-primary-700 hover:shadow-md'
                              : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      aria-current={isActivePage ? 'page' : undefined}
                    >
                      <IconComponent
                        className={`h-5 w-5 transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-110 ${
                          isShop || isActivePage
                            ? 'text-current'
                            : 'text-slate-400 group-hover:text-primary-600'
                        }`}
                        aria-hidden="true"
                      />
                      {item.label}
                    </Link>
                  );
                })}
                <Link
                  href="/shop/cart"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50"
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