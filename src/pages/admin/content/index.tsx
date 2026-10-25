import AdminLayout from '@/components/AdminLayout';
import ContentSidebar from '@/components/admin/ContentSidebar';

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

function ContentDashboard() {
  return (
    <AdminLayout title="مدیریت محتوای سایت">
      <div className="flex">
        {/* Sidebar */}
        <ContentSidebar />

        {/* Main Content */}
        <div className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">مدیریت محتوای سایت</h1>
            <p className="text-gray-600 mt-1">
              مدیریت تمام داده‌های نمایشی در صفحات مختلف وب‌سایت
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {contentSections.map((section) => (
              <a
                key={section.href}
                href={section.href}
                className="group block bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-transparent hover:border-primary-500"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {section.label}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">{section.description}</p>
              </a>
            ))}
          </div>

          <div className="mt-8 bg-primary-50 border border-primary-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-primary-900 mb-2">نکات مهم</h3>
            <ul className="text-primary-800 space-y-1 text-sm">
              <li>• تمام تغییرات بلافاصله در سایت اعمال می‌شوند</li>
              <li>• ترتیب نمایش با فیلد «ترتیب نمایش» (displayOrder) کنترل می‌شود</li>
              <li>• برای مخفی کردن آیتم‌ها، تیک «فعال» را بردارید</li>
              <li>• پس از ذخیره، به صفحه لیست مربوطه هدایت می‌شوید</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ContentDashboard;