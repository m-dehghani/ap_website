import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { Badge } from '@/components/ui/Badge';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { TableColumn } from '@/components/ui/Table';

interface HeroAchievement {
  id: string;
  icon: string;
  number: string;
  label: string;
  color: string;
  bg: string;
  position: string;
  isActive: boolean;
  displayOrder: number;
}

const columns: TableColumn<HeroAchievement>[] = [
  {
    key: 'icon',
    header: 'آیکون',
    render: (item) => <span className="text-2xl">{item.icon}</span>,
  },
  {
    key: 'number',
    header: 'شماره',
  },
  {
    key: 'label',
    header: 'برچسب',
  },
  {
    key: 'isActive',
    header: 'وضعیت',
    render: (item) => (
      <Badge variant={item.isActive ? 'success' : 'default'}>
        {item.isActive ? 'فعال' : 'غیرفعال'}
      </Badge>
    ),
  },
  {
    key: 'displayOrder',
    header: 'ترتیب',
    render: (item) => String(item.displayOrder),
  },
];

export default function HeroAchievementsPage() {
  return (
    <AdminLayout title="دستاوردهای هیرو">
      <AdminListPage<HeroAchievement>
        title="دستاوردهای هیرو"
        description="مدیریت نشان‌های دستاورد روی اسلایدر اصلی"
        addHref="/admin/content/hero-achievements/new"
        addLabel="افزودن دستاورد"
        columns={columns}
        fetchFn={() => fetchJson<HeroAchievement[]>('/api/admin/content/hero-achievements')}
        deleteFn={(id) => deleteResource(`/api/admin/content/hero-achievements/${id}`)}
        editHref={(item) => `/admin/content/hero-achievements/${item.id}`}
        accent="primary"
        confirmDeleteMessage="آیا از حذف این دستاورد مطمئن هستید؟"
        emptyMessage="هیچ دستاوردی تعریف نشده"
      />
    </AdminLayout>
  );
}