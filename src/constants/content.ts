/**
 * Content constants - replaces hardcoded data in components
 * This data should ideally come from a CMS or database
 */

import type { NewsArticleCardViewModel } from '@/types/viewModels/content';

// Hero Section Data
export const HERO_SLIDES = [
  {
    title: 'آکادمی فوتبال افشین پیروانی',
    subtitle: 'جایی که قهرمانان ساخته می‌شوند',
    description:
      'اشتیاق خود را به تعالی تبدیل کنید — آموزش حرفه‌ای، مربیان کارآزموده و امکانات درجه یک برای بالا بردن سطح بازی شما.',
    cta: { label: 'شروع ثبت نام', href: '/register' },
    ctaSecondary: { label: 'داستان ما', href: '/about' },
    bgGradient: 'from-navy-950 via-primary-900 to-primary-700',
    stats: { players: '۵۰۰+', championships: '۲۵+', experience: '۱۰+' },
  },
  {
    title: 'مربیگری متخصص',
    subtitle: 'از بهترین‌ها بیاموزید',
    description:
      'مربیان دارای مدرک فیفا با دهه‌ها تجربه حرفه‌ای — برنامه‌های آموزشی شخصی‌سازی‌شده برای تسلط بر تمام جنبه‌های فوتبال.',
    cta: { label: 'مربیان ما', href: '/coaches' },
    ctaSecondary: { label: 'برنامه‌ها', href: '/programs' },
    bgGradient: 'from-navy-950 via-secondary-900 to-secondary-700',
    stats: { coaches: '۱۲+', certifications: 'فیفا', rating: '۴.۹/۵' },
  },
  {
    title: 'امکانات مدرن',
    subtitle: 'مثل حرفه‌ای‌ها تمرین کنید',
    description:
      'زمین‌های تمرین پیشرفته، چمن استاندارد فیفا و تجهیزات مدرن برای بهینه‌سازی رشد و عملکرد بازیکنان.',
    cta: { label: 'تماس با ما', href: '/contact' },
    ctaSecondary: { label: 'ثبت نام', href: '/register' },
    bgGradient: 'from-navy-950 via-accent-900 to-accent-700',
    stats: { facilities: '۳', pitches: 'فیفا', equipment: 'حرفه‌ای' },
  },
] as const;

export const HERO_ACHIEVEMENTS = [
  {
    icon: 'TrophyIcon',
    number: '۲۵+',
    label: 'قهرمانی',
    color: 'text-gold-400',
    bg: 'bg-gold-400/20',
    position: 'top-6 -left-6',
  },
  {
    icon: 'StarIcon',
    number: '۵۰۰+',
    label: 'بازیکن',
    color: 'text-secondary-300',
    bg: 'bg-secondary-400/20',
    position: 'bottom-8 -right-4',
  },
  {
    icon: 'UsersIcon',
    number: '۱۰+',
    label: 'سال تجربه',
    color: 'text-accent-300',
    bg: 'bg-accent-400/20',
    position: 'top-1/2 -left-10 -translate-y-1/2',
  },
] as const;

export const STAT_LABELS: Record<string, string> = {
  players: 'بازیکن آموزش‌دیده',
  championships: 'قهرمانی',
  experience: 'سال تجربه',
  coaches: 'مربی متخصص',
  certifications: 'مدرک بین‌المللی',
  rating: 'امتیاز رضایت',
  facilities: 'مجموعه ورزشی',
  pitches: 'زمین استاندارد',
  equipment: 'تجهیزات حرفه‌ای',
};

// Features Section Data
export const FEATURES = [
  {
    icon: 'TrophyIcon',
    title: 'مربیگری متخصص',
    description:
      'مربیان دارای مدرک فیفا با تجربه حرفه‌ای که در توسعه استعدادهای جوان و مهارت‌های پیشرفته تخصص دارند.',
    color: 'from-accent-500 to-accent-600',
    bgColor: 'bg-accent-50',
    iconColor: 'text-accent-600',
    stats: '۱۲+ مربی',
  },
  {
    icon: 'UserGroupIcon',
    title: 'محیط حمایتی',
    description:
      'فضای مثبت و تشویق‌کننده طراحی شده برای ایجاد اعتماد به نفس و رشد بازیکنان در تمام سطوح.',
    color: 'from-secondary-500 to-secondary-600',
    bgColor: 'bg-secondary-50',
    iconColor: 'text-secondary-600',
    stats: 'تمام سنین',
  },
  {
    icon: 'AcademicCapIcon',
    title: 'برنامه‌های تخصصی',
    description:
      'برنامه‌های آموزشی اختصاصی که نیازهای رشد جسمی و ذهنی خاص هر گروه سنی را پوشش می‌دهد.',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    stats: '۴ برنامه',
  },
  {
    icon: 'SparklesIcon',
    title: 'تجهیزات مدرن',
    description:
      'تجهیزات آموزشی پیشرفته و تکنولوژی فوتبال مدرن برای بهترین تجربه یادگیری.',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    stats: 'سطح حرفه‌ای',
  },
  {
    icon: 'ShieldCheckIcon',
    title: 'امنیت و انضباط',
    description:
      'محیط امن و منضبط با بالاترین استانداردهای ایمنی و پیشگیری جامع از آسیب‌ها.',
    color: 'from-navy-500 to-navy-600',
    bgColor: 'bg-navy-50',
    iconColor: 'text-navy-600',
    stats: '۱۰۰% امن',
  },
  {
    icon: 'LightBulbIcon',
    title: 'توسعه شخصیت',
    description:
      'تمرکز بر ایجاد شخصیت قوی، مهارت‌های رهبری و مسئولیت‌پذیری در کنار تعالی فوتبال.',
    color: 'from-primary-500 to-primary-600',
    bgColor: 'bg-primary-50',
    iconColor: 'text-primary-600',
    stats: 'مهارت‌های زندگی',
  },
] as const;

export const FEATURE_STATS = [
  {
    number: '۵۰۰+',
    label: 'بازیکن فعال',
    icon: 'UserGroupIcon',
    color: 'text-secondary-600',
  },
  {
    number: '۹۸%',
    label: 'میزان رضایت',
    icon: 'StarIcon',
    color: 'text-accent-600',
  },
  {
    number: '۱۰+',
    label: 'سال تجربه',
    icon: 'ClockIcon',
    color: 'text-emerald-600',
  },
  {
    number: '۲۵+',
    label: 'قهرمانی',
    icon: 'TrophyIcon',
    color: 'text-primary-600',
  },
] as const;

export const ADDITIONAL_FEATURES = [
  {
    icon: 'RocketLaunchIcon',
    title: 'آموزش هدفمند',
    description:
      'برنامه‌های ساختاریافته با اهداف مشخص و پیشرفت قابل اندازه‌گیری.',
  },
  {
    icon: 'HeartIcon',
    title: 'توجه فردی',
    description:
      'مربیگری شخصی‌سازی‌شده تا هر بازیکن پشتیبانی اختصاصی دریافت کند.',
  },
  {
    icon: 'CogIcon',
    title: 'روحیه تیمی',
    description: 'تقویت همکاری و مهارت‌های کار گروهی در زمین و خارج از آن.',
  },
  {
    icon: 'SparklesIcon',
    title: 'استاندارد بالا',
    description: 'استانداردهای آموزشی بین‌المللی برای آمادگی رقابتی.',
  },
] as const;

// Success Stories Data
export const SUCCESS_ACHIEVEMENTS = [
  {
    id: 1,
    playerName: 'امیر رضایی',
    age: 19,
    achievement: 'انتقال به باشگاه پرسپولیس',
    description:
      'پس از ۴ سال تمرین در آکادمی افشین پیروانی، امیر موفق به عضویت در تیم جوانان پرسپولیس شد',
    image: '/api/placeholder/150/150',
    date: '۱۴۰۲/۰۶/۱۵',
    program: 'برنامه نوجوانان',
    coach: 'علی احمدی',
    quote:
      'آکادمی افشین پیروانی پایه و اساس موفقیت من بود. مربیان فوق‌العاده‌ای داشتم.',
    stats: { goals: 45, assists: 23, matches: 67 },
  },
  {
    id: 2,
    playerName: 'محمد حسینی',
    age: 17,
    achievement: 'قهرمان لیگ جوانان تهران',
    description: 'کاپیتان تیم جوانان که آکادمی را به قهرمانی رساند',
    image: '/api/placeholder/150/150',
    date: '۱۴۰۲/۰۵/۲۰',
    program: 'برنامه نوجوانان',
    coach: 'محمد کریمی',
    quote: 'تیم‌ما مثل یک خانواده بود. هر روز با انگیزه به تمرین می‌آمدیم.',
    stats: { goals: 38, assists: 31, matches: 52 },
  },
  {
    id: 3,
    playerName: 'علی نوری',
    age: 16,
    achievement: 'دعوت به تیم ملی جوانان',
    description: 'اولین بازیکن آکادمی که به تیم ملی جوانان دعوت شد',
    image: '/api/placeholder/150/150',
    date: '۱۴۰۲/۰۴/۱۰',
    program: 'برنامه نوجوانان',
    coach: 'علی احمدی',
    quote:
      'رویای هر پسر ایرانی بازی برای تیم ملی است. آکادمی این رویا را محقق کرد.',
    stats: { goals: 52, assists: 19, matches: 48 },
  },
] as const;

export const SUCCESS_TESTIMONIALS = [
  {
    id: 1,
    name: 'احمد کریمی',
    role: 'بازیکن سابق',
    program: 'برنامه بزرگسالان',
    rating: 5,
    text: 'بهترین آکادمی فوتبال که تا به حال دیدم. مربیان فوق‌العاده و امکانات عالی. پس از ۶ ماه تمرین، سطح بازی‌ام به طور قابل توجهی بهبود یافت.',
    image: '/api/placeholder/60/60',
    date: '۱۴۰۲/۰۷/۱۲',
    improvement: '+۴۰٪ مهارت فنی',
  },
  {
    id: 2,
    name: 'حسن احمدی',
    role: 'والد دانش‌آموز',
    program: 'برنامه کودکان',
    rating: 5,
    text: 'پسرم در آکادمی افشین پیروانی نه تنها فوتبال یاد گرفت بلکه اعتماد به نفس و روحیه تیمی پیدا کرد. مربیان بسیار صبور و حرفه‌ای هستند.',
    image: '/api/placeholder/60/60',
    date: '۱۴۰۲/۰۶/۲۵',
    improvement: '+۶۰٪ اعتماد به نفس',
  },
  {
    id: 3,
    name: 'رضا میرزایی',
    role: 'بازیکن فعال',
    program: 'برنامه استادان',
    rating: 5,
    text: 'در سن ۲۸ سالگی فکر می‌کردم دیگر نمی‌توانم مهارت‌هایم را بهبود دهم. اما آکادمی افشین پیروانی ثابت کرد که هرگز دیر نیست.',
    image: '/api/placeholder/60/60',
    date: '۱۴۰۲/۰۵/۳۰',
    improvement: '+۲۵٪ آمادگی جسمانی',
  },
] as const;

export const SUCCESS_STATISTICS = [
  {
    number: '۹۵٪',
    label: 'بازیکنان موفق',
    description: 'از دانش‌آموزان ما به سطح بالاتری رسیدند',
    icon: 'TrophyIcon',
    color: 'text-yellow-600',
  },
  {
    number: '۱۵+',
    label: 'انتقال به باشگاه',
    description: 'بازیکن به باشگاه‌های حرفه‌ای پیوستند',
    icon: 'ArrowTrendingUpIcon',
    color: 'text-green-600',
  },
  {
    number: '۳',
    label: 'تیم ملی',
    description: 'بازیکن به تیم‌های ملی دعوت شدند',
    icon: 'StarIcon',
    color: 'text-primary-600',
  },
  {
    number: '۲۵+',
    label: 'قهرمانی',
    description: 'عنوان قهرمانی در مسابقات مختلف',
    icon: 'TrophyIcon',
    color: 'text-purple-600',
  },
] as const;

export const SUCCESS_MILESTONES = [
  {
    year: '۱۳۹۹',
    event: 'تأسیس آکادمی',
    description: 'شروع فعالیت با ۲۰ دانش‌آموز',
  },
  {
    year: '۱۴۰۰',
    event: 'اولین قهرمانی',
    description: 'قهرمانی در لیگ جوانان منطقه',
  },
  {
    year: '۱۴۰۱',
    event: 'گسترش فعالیت',
    description: 'افزایش ظرفیت به ۲۰۰ دانش‌آموز',
  },
  {
    year: '۱۴۰۲',
    event: 'موفقیت‌های بزرگ',
    description: 'انتقال اولین بازیکن به لیگ برتر',
  },
] as const;

// News Updates Data
export const NEWS_CATEGORIES = [
  { id: 'all', name: 'همه اخبار', icon: '📰' },
  { id: 'matches', name: 'مسابقات', icon: '⚽' },
  { id: 'training', name: 'تمرینات', icon: '🏃' },
  { id: 'events', name: 'رویدادها', icon: '🎉' },
  { id: 'achievements', name: 'موفقیت‌ها', icon: '🏆' },
] as const;

export const NEWS_ARTICLES: NewsArticleCardViewModel[] = [
  {
    id: 1,
    title: 'قهرمانی تیم نوجوانان در مسابقات منطقه‌ای',
    excerpt:
      'تیم نوجوانان آکادمی افشین پیروانی با نتیجه ۳-۱ در فینال مسابقات منطقه‌ای به قهرمانی رسید',
    content:
      'در یک بازی پرهیجان، تیم نوجوانان آکادمی افشین پیروانی توانست با نمایش فوق‌العاده‌ای عنوان قهرمانی مسابقات منطقه‌ای را کسب کند. این قهرمانی اولین عنوان بزرگ آکادمی در سال ۱۴۰۲ محسوب می‌شود.',
    category: 'matches',
    date: '۱۴۰۲/۰۸/۱۵',
    author: 'مدیر آکادمی',
    image: '/api/placeholder/400/250',
    tags: ['قهرمانی', 'نوجوانان', 'مسابقات'],
    readTime: '۳ دقیقه',
    likes: 156,
    comments: 23,
    type: 'news',
    featured: true,
  },
  {
    id: 2,
    title: 'برگزاری کمپ تابستانی ویژه',
    excerpt:
      'کمپ تابستانی آکادمی افشین پیروانی با حضور مربیان برتر و برنامه‌های متنوع آغاز شد',
    content:
      'کمپ تابستانی امسال با حضور بیش از ۱۰۰ کودک و نوجوان برگزار شد. این کمپ شامل تمرینات فنی، بازی‌های تفریحی و اردوی یک روزه بود.',
    category: 'events',
    date: '۱۴۰۲/۰۸/۱۰',
    author: 'تیم اجرایی',
    image: '/api/placeholder/400/250',
    tags: ['کمپ تابستانی', 'کودکان', 'تفریح'],
    readTime: '۲ دقیقه',
    likes: 89,
    comments: 12,
    type: 'news',
    featured: false,
  },
  {
    id: 3,
    title: 'ویدئو: تمرینات جدید آمادگی جسمانی',
    excerpt:
      'آشنایی با تمرینات جدید آمادگی جسمانی که در آکادمی افشین پیروانی استفاده می‌شود',
    content:
      'در این ویدئو، مربی آمادگی جسمانی آکادمی روش‌های نوین تمرینات قدرتی و هوازی را معرفی می‌کند.',
    category: 'training',
    date: '۱۴۰۲/۰۸/۰۸',
    author: 'حسن میرزایی',
    image: '/api/placeholder/400/250',
    tags: ['آمادگی جسمانی', 'تمرین', 'ویدئو'],
    readTime: '۵ دقیقه',
    likes: 234,
    comments: 45,
    type: 'video',
    featured: true,
  },
  {
    id: 4,
    title: 'دستاورد جدید: انتقال بازیکن به لیگ برتر',
    excerpt:
      'علی نوری، فارغ‌التحصیل آکادمی افشین پیروانی، به تیم جوانان استقلال پیوست',
    content:
      'علی نوری که ۴ سال در آکادمی افشین پیروانی تمرین کرده بود، امروز قراردادش با تیم جوانان باشگاه استقلال را امضا کرد.',
    category: 'achievements',
    date: '۱۴۰۲/۰۸/۰۵',
    author: 'خبرنگار ورزشی',
    image: '/api/placeholder/400/250',
    tags: ['انتقال', 'لیگ برتر', 'موفقیت'],
    readTime: '۴ دقیقه',
    likes: 312,
    comments: 67,
    type: 'news',
    featured: true,
  },
  {
    id: 5,
    title: 'گالری تصاویر: جشن قهرمانی',
    excerpt: 'تصاویر جشن قهرمانی تیم نوجوانان آکادمی افشین پیروانی',
    content:
      'مجموعه‌ای از بهترین تصاویر جشن قهرمانی تیم نوجوانان در حضور خانواده‌ها و مربیان.',
    category: 'events',
    date: '۱۴۰۲/۰۸/۰۳',
    author: 'عکاس آکادمی',
    image: '/api/placeholder/400/250',
    tags: ['جشن', 'تصاویر', 'قهرمانی'],
    readTime: '۱ دقیقه',
    likes: 198,
    comments: 34,
    type: 'gallery',
    featured: false,
  },
  {
    id: 6,
    title: 'معرفی مربی جدید: احمد صالحی',
    excerpt:
      'احمد صالحی، مربی سابق تیم ملی جوانان، به تیم مربیگری افشین پیروانی پیوست',
    content:
      'احمد صالحی با ۲۰ سال تجربه مربیگری در تیم‌های مختلف، مسئولیت آموزش برنامه بزرگسالان را بر عهده خواهد داشت.',
    category: 'training',
    date: '۱۴۰۲/۰۸/۰۱',
    author: 'مدیر آکادمی',
    image: '/api/placeholder/400/250',
    tags: ['مربی جدید', 'تیم ملی', 'بزرگسالان'],
    readTime: '۳ دقیقه',
    likes: 145,
    comments: 28,
    type: 'news',
    featured: false,
  },
] as const;

// Testimonials Data
export const TESTIMONIALS = [
  {
    id: 1,
    name: 'احمد کریمی',
    role: 'پدر دانش آموز',
    content:
      'فرزندم در این آکادمی مهارت‌هایش را به طور چشمگیری بهبود داده است. مربیان بسیار صبور و حرفه‌ای هستند.',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80',
    rating: 5,
  },
  {
    id: 2,
    name: 'علی احمدی',
    role: 'بازیکن ۱۶ ساله',
    content:
      'محیط آکادمی فوق‌العاده است. تمرینات جذاب و چالش‌برانگیز هستند. احساس می‌کنم هر روز بهتر می‌شوم.',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80',
    rating: 5,
  },
  {
    id: 3,
    name: 'محمد نوری',
    role: 'بازیکن ۲۲ ساله',
    content:
      'این آکادمی واقعاً تفاوت کرده است. من از سطح آماتور به سطح نیمه حرفه‌ای رسیده‌ام.',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80',
    rating: 5,
  },
  {
    id: 4,
    name: 'حسن محمدی',
    role: 'بازیکن ۲۸ ساله',
    content:
      'بعد از سال‌ها دوری از فوتبال، این آکادمی کمک کرد تا دوباره آمادگی‌ام را بازیابم و لذت فوتبال را تجربه کنم.',
    image:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80',
    rating: 5,
  },
  {
    id: 5,
    name: 'رضا قادری',
    role: 'بازیکن ۱۴ ساله',
    content:
      'مربیان اینجا واقعاً استعداد منو دیدند و کمک کردند تا مهارت‌هایم را پیشرفت بدم. خیلی خوشحالم.',
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80',
    rating: 5,
  },
  {
    id: 6,
    name: 'سامان رضایی',
    role: 'بازیکن ۲۶ ساله',
    content:
      'به عنوان یک بازیکن با تجربه، این آکادمی کمک کرد تا تکنیک‌هایم را ارتقا بدم و دوباره انگیزه پیدا کنم.',
    image:
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80',
    rating: 5,
  },
] as const;

export const TESTIMONIAL_STATS = [
  { number: '۸۵٪', label: 'پیشرفت مهارت', description: 'طی ۶ ماه' },
  { number: '۲۵+', label: 'بورسیه دانشگاهی', description: 'در ۳ سال گذشته' },
  { number: '۹۵٪', label: 'رضایت والدین', description: 'بطور مستمر' },
  {
    number: '۱۵۰+',
    label: 'قهرمانی تورنمنت',
    description: 'در تمام گروه‌های سنی',
  },
] as const;

// Footer Data - Moved to app.ts to avoid duplication
// export const FOOTER_SOCIAL_LINKS = [...]
// export const FOOTER_TRAINING_HOURS = [...]

// CTA Section Data
export const CTA_CONTENT = {
  title: 'آماده شروع سفر فوتبال خود هستید؟',
  description:
    'به صدها بازیکنی بپیوندید که با آموزش حرفه‌ای، بازی خود را متحول کرده‌اند.',
  primaryCTA: { label: 'همین امروز شروع کنید', href: '/register' },
  secondaryCTA: { label: 'رزرو بازدید', href: '/contact' },
} as const;

// About Page Data
export const ABOUT_STORY = [
  'آکادمی فوتبال افشین پیروانی در سال ۱۳۹۰ با هدف ایجاد یک مرکز آموزشی جامع و حرفه‌ای برای فوتبال تأسیس شد. ما با یک رویا آغاز کردیم: پرورش نسل جدیدی از فوتبالیست‌های ایرانی که هم از لحاظ فنی و هم از لحاظ اخلاقی در سطح بالایی قرار داشته باشند.',
  'از همان ابتدا، تأکید ما بر کیفیت آموزش و رشد همه‌جانبه بازیکنان بوده است. ما معتقدیم که فوتبال تنها یک ورزش نیست، بلکه ابزاری برای یادگیری انضباط، کار تیمی و رسیدن به اهداف است.',
  'امروز، پس از گذشت بیش از یک دهه، آکادمی ما به یکی از معتبرترین مراکز آموزش فوتبال کشور تبدیل شده است. صدها بازیکن جوان از آکادمی ما فارغ‌التحصیل شده‌اند و بسیاری از آنها در لیگ‌های مختلف کشور بازی می‌کنند.',
] as const;

export const ABOUT_MISSION = {
  title: 'ماموریت ما',
  description:
    'آموزش حرفه‌ای فوتبال و پرورش نسل آینده فوتبال ایران با تأکید بر ارزش‌های اخلاقی و انسانی',
  icon: 'TrophyIcon',
  color: 'text-primary-600',
} as const;

export const ABOUT_VISION = {
  title: 'چشم‌انداز ما',
  description:
    'تبدیل شدن به برترین آکادمی فوتبال خاورمیانه و تربیت بازیکنانی که در سطح بین‌المللی بدرخشند',
  icon: 'StarIcon',
  color: 'text-secondary-600',
} as const;

export const ABOUT_VALUES = {
  title: 'ارزش‌های ما',
  items: [
    'کیفیت در آموزش',
    'احترام و صداقت',
    'کار تیمی و همکاری',
    'تعهد و پشتکار',
  ],
  icon: 'HeartIcon',
  color: 'text-accent-600',
} as const;

export const ABOUT_STATISTICS = [
  { number: '۵۰۰+', label: 'بازیکن فعال', color: 'text-primary-600' },
  { number: '۲۵+', label: 'قهرمانی', color: 'text-secondary-600' },
  { number: '۱۵+', label: 'بازیکن حرفه‌ای', color: 'text-accent-600' },
  { number: '۱۰+', label: 'سال تجربه', color: 'text-emerald-600' },
] as const;

export const ABOUT_TEAM = [
  {
    initials: 'AP',
    name: 'علی احمدی',
    role: 'مدیر عامل و بنیانگذار',
    description: 'بازیکن سابق تیم ملی با بیش از ۱۵ سال تجربه مربیگری',
    bgColor: 'from-primary-500 to-primary-600',
  },
  {
    initials: 'MK',
    name: 'محمد کریمی',
    role: 'مدیر آموزش',
    description: 'متخصص روانشناسی ورزشی و توسعه مهارت‌های فردی',
    bgColor: 'from-secondary-500 to-secondary-600',
  },
  {
    initials: 'HM',
    name: 'حسن میرزایی',
    role: 'مدیر آمادگی جسمانی',
    description: 'کارشناس فیزیولوژی ورزش و پیشگیری از آسیب‌های ورزشی',
    bgColor: 'from-accent-500 to-accent-600',
  },
] as const;

export const ABOUT_FACILITIES = {
  pitches: [
    '۲ زمین چمن طبیعی استاندارد فیفا',
    '۱ زمین چمن مصنوعی',
    'سالن ورزشی سرپوشیده',
    'زمین‌های کوچک برای تمرینات تخصصی',
  ],
  equipment: [
    'تجهیزات آمادگی جسمانی مدرن',
    'سیستم آنالیز ویدئو',
    'رختکن و دوش مجهز',
    'کافی‌شاپ و فروشگاه',
  ],
} as const;
