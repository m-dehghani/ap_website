import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { Badge } from '@/components/ui/Badge';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { TableColumn } from '@/components/ui/Table';

interface HeroContent {
  id: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  displayOrder: number;
}

const columns: TableColumn<HeroContent>[] = [
  {
    key: 'title',
    header: 'عنوان',
  },
  {
    key: 'subtitle',
    header: 'زیرعنوان',
    render: (item) => <span className="max-w-xs truncate block">{item.subtitle}</span>,
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

export default function HeroContentPage() {
  return (
    <AdminLayout title="محتوای هیرو (اسلایدر اصلی)">
      <AdminListPage<HeroContent>
        title="اسلایدرهای هیرو"
        description="مدیریت اسلایدرهای اصلی صفحه خانه"
        addHref="/admin/content/hero-content/new"
        addLabel="افزودن اسلایدر"
        columns={columns}
        fetchFn={() => fetchJson<HeroContent[]>('/api/admin/content/hero-content')}
        deleteFn={(id) => deleteResource(`/api/admin/content/hero-content/${id}`)}
        editHref={(item) => `/admin/content/hero-content/${item.id}`}
        accent="primary"
        confirmDeleteMessage="آیا از حذف این اسلایدر مطمئن هستید؟"
        emptyMessage="هیچ اسلایدری تعریف نشده"
      />
    </AdminLayout>
  );
}