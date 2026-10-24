import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { Badge } from '@/components/ui/Badge';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { TableColumn } from '@/components/ui/Table';

interface FeaturesContent {
  id: string;
  icon: string;
  title: string;
  color: string;
  isActive: boolean;
  displayOrder: number;
}

const columns: TableColumn<FeaturesContent>[] = [
  {
    key: 'icon',
    header: 'آیکون',
    render: (item) => <span className="text-2xl">{item.icon}</span>,
  },
  {
    key: 'title',
    header: 'عنوان',
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

export default function FeaturesContentPage() {
  return (
    <AdminLayout title="ویژگی‌های صفحه خانه">
      <AdminListPage<FeaturesContent>
        title="ویژگی‌های صفحه خانه"
        description="مدیریت کارت‌های ویژگی‌های صفحه خانه"
        addHref="/admin/content/features-content/new"
        addLabel="افزودن ویژگی"
        columns={columns}
        fetchFn={() => fetchJson<FeaturesContent[]>('/api/admin/content/features-content')}
        deleteFn={(id) => deleteResource(`/api/admin/content/features-content/${id}`)}
        editHref={(item) => `/admin/content/features-content/${item.id}`}
        accent="primary"
        confirmDeleteMessage="آیا از حذف این ویژگی مطمئن هستید؟"
        emptyMessage="هیچ ویژگی تعریف نشده"
      />
    </AdminLayout>
  );
}