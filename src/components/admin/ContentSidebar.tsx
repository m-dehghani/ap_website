import Link from 'next/link';
import { useRouter } from 'next/router';

const contentSections = [
  { href: '/admin/content/hero-content', label: 'اسلایدرهای هیرو', icon: '🖼️', description: 'اسلایدرهای اصلی صفحه خانه' },
  { href: '/admin/content/hero-achievements', label: 'دستاوردهای هیرو', icon: '🏆', description: 'نشان‌های دستاورد روی اسلایدر' },
  { href: '/admin/content/features-content', label: 'ویژگی‌ها', icon: '✨', description: 'کارت‌های ویژگی‌های صفحه خانه' },
  { href: '/admin/content/feature-stats', label: 'آمارهای ویژگی‌ها', icon: '📊', description: 'اعداد متحرک بخش ویژگی‌ها' },
  { href: '/admin/content/cta-content', label: 'بخش CTA', icon: '📢', description: 'دعوت به اقدام در صفحه خانه' },
  { href: '/admin/content/about-content', label: 'صفحه درباره ما', icon: 'ℹ️', description: 'بخش‌های مختلف صفحه درباره ما' },
  { href: '/admin/content/academy-info', label: 'اطلاعات آکادمی', icon: '🏫', description: 'نام، آدرس، تماس، دامنه' },
  { href: '/admin/content/opening-hours', label: 'ساعات کاری', icon: '🕐', description: 'ساعات اداری و تمرینی' },
  { href: '/admin/content/social-links', label: 'شبکه‌های اجتماعی', icon: '🔗', description: 'لینک‌های اینستاگرام، تلگرام و...' },
  { href: '/admin/content/statistics', label: 'آمار و ارقام', icon: '📈', description: 'شمارنده‌های کلیدی سایت' },
  { href: '/admin/content/testimonials', label: 'نظرات کاربران', icon: '💬', description: 'نظرات و توصیه‌های کاربران' },
  { href: '/admin/content/success-stories', label: 'داستان‌های موفقیت', icon: '🌟', description: 'داستان‌های پیشرفت بازیکنان' },
  { href: '/admin/content/milestones', label: 'مراحل مهم', icon: '📅', description: 'رویدادهای کلیدی تاریخچه' },
  { href: '/admin/content/staff-members', label: 'اعضای تیم', icon: '👥', description: 'اعضای تیم مدیریت' },
  { href: '/admin/content/facilities', label: 'امکانات', icon: '🏟️', description: 'زمین‌های تمرین و تجهیزات' },
  { href: '/admin/content/news-categories', label: 'دسته‌بندی اخبار', icon: '📂', description: 'دسته‌بندی‌های اخبار و رویدادها' },
  { href: '/admin/content/news-articles', label: 'مقالات و اخبار', icon: '📰', description: 'مدیریت اخبار، ویدئو و گالری' },
];

export function ContentSidebar() {
  const router = useRouter();

  return (
    <aside className="w-64 bg-white border-l border-gray-200 min-h-screen hidden lg:block">
      <nav className="p-4 space-y-1">
        {contentSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
              router.pathname === section.href || router.pathname.startsWith(section.href + '/')
                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-2xl" aria-hidden="true">{section.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{section.label}</p>
              <p className="text-xs text-gray-400 truncate">{section.description}</p>
            </div>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default ContentSidebar;