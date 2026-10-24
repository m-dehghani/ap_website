import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { Badge } from '@/components/ui/Badge';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { TableColumn } from '@/components/ui/Table';

interface FeatureStatItem {
  id: string;
  number: string;
  label: string;
  description: string | null;
  icon: string;
  color: string;
  isActive: boolean;
  displayOrder: number;
}

const columns: TableColumn<FeatureStatItem>[] = [
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
    key: 'description',
    header: 'توضیح',
    render: (item) => item.description ?? <span className="text-gray-400">—</span>,
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

export default function FeatureStatsPage() {
  return (
    <AdminLayout title="آمارهای ویژگی‌ها">
      <AdminListPage<FeatureStatItem>
        title="آمارهای ویژگی‌ها"
        description="مدیریت اعداد متحرک بخش ویژگی‌ها"
        addHref="/admin/content/feature-stats/new"
        addLabel="افزودن آمار"
        columns={columns}
        fetchFn={() => fetchJson<FeatureStatItem[]>('/api/admin/content/feature-stats')}
        deleteFn={(id) => deleteResource(`/api/admin/content/feature-stats/${id}`)}
        editHref={(item) => `/admin/content/feature-stats/${item.id}`}
        accent="amber"
        confirmDeleteMessage="آیا از حذف این آمار مطمئن هستید؟"
        emptyMessage="هیچ آمار تعریف نشده"
      />
    </AdminLayout>
  );
}