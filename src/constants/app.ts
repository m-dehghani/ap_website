/**
 * Application-wide constants
 * Centralized configuration to avoid hardcoded values
 */

export const APP_CONFIG = {
  name: 'آکادمی فوتبال AP',
  tagline: 'جایی که قهرمانان ساخته می‌شوند',
  description:
    'آکادمی فوتبال AP با مربیان حرفه‌ای و امکانات مدرن، بهترین آموزش فوتبال را برای سنین ۸ تا ۳۰ سال ارائه می‌دهد.',
  domain: 'https://ap-football.com',
  email: 'info@ap-football.com',
  phone: '021-12345678',
  address: 'مرکز آموزش فوتبال، مجموعه ورزشی مرکز شهر',
  city: 'تهران',
  foundedYear: 1393,
  socialLinks: {
    instagram: 'https://instagram.com/ap_football',
    telegram: 'https://t.me/ap_football',
    youtube: 'https://youtube.com/@ap_football',
    whatsapp: 'https://wa.me/982112345678',
  },
  seo: {
    defaultTitle: 'آکادمی فوتبال AP - بهترین آموزش فوتبال برای همه سنین',
    defaultDescription:
      'آکادمی فوتبال AP با مربیان حرفه‌ای و امکانات مدرن، بهترین آموزش فوتبال را برای سنین ۸ تا ۳۰ سال ارائه می‌دهد. همین امروز ثبت نام کنید.',
    ogImage: '/og-image.jpg',
    twitterHandle: '@ap_football',
  },
} as const;

export const NAVIGATION = {
  main: [
    { label: 'خانه', href: '/' },
    { label: 'برنامه‌ها', href: '/programs' },
    { label: 'مربیان', href: '/coaches' },
    { label: 'اخبار', href: '/news' },
    { label: 'تماس', href: '/contact' },
  ],
  footer: {
    quickLinks: [
      { label: 'درباره آکادمی', href: '/about' },
      { label: 'برنامه‌های آموزشی', href: '/programs' },
      { label: 'مربیان ما', href: '/coaches' },
      { label: 'داستان‌های موفقیت', href: '/success' },
      { label: 'اخبار و رویدادها', href: '/news' },
      { label: 'تماس با ما', href: '/contact' },
    ],
    programs: [
      { label: 'مشاهده همه برنامه‌ها', href: '/programs' },
    ],
    legal: [
      { label: 'حریم خصوصی', href: '/privacy' },
      { label: 'قوانین و مقررات', href: '/terms' },
      { label: 'سیاست کوکی', href: '/cookies' },
    ],
  },
} as const;

export const UI_CONSTANTS = {
  animation: {
    defaultDuration: 0.6,
    staggerDelay: 0.1,
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    navy: '#1E3A5F',
  },
} as const;

export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 50,
} as const;

export const FORM_VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'فرمت ایمیل نامعتبر است',
  },
  phone: {
    pattern: /^09\d{9}$/,
    message: 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود',
  },
  password: {
    minLength: 8,
    message: 'رمز عبور باید حداقل ۸ کاراکتر باشد',
  },
} as const;

export const FOOTER_SOCIAL_LINKS = [
  { name: 'Instagram', url: 'https://instagram.com/ap_football', icon: '📸' },
  { name: 'Telegram', url: 'https://t.me/ap_football', icon: '💬' },
  { name: 'YouTube', url: 'https://youtube.com/@ap_football', icon: '🎥' },
  { name: 'WhatsApp', url: 'https://wa.me/982112345678', icon: '📱' },
] as const;

export const FOOTER_TRAINING_HOURS = [
  { days: 'دوشنبه - جمعه', hours: '16:00 - 21:00' },
  { days: 'شنبه', hours: '09:00 - 18:00' },
  { days: 'یکشنبه', hours: '10:00 - 16:00' },
] as const;
