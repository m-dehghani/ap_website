import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { TableColumn } from '@/components/ui/Table';

interface Statistic {
  id: string;
  key: string;
  value: string;
  label: string;
  description: string | null;
  displayOrder: number;
}

const columns: TableColumn<Statistic>[] = [
  {
    key: 'key',
    header: 'کلید',
    render: (item) => <code className="px-2 py-1 bg-gray-100 rounded text-sm">{item.key}</code>,
  },
  {
    key: 'value',
    header: 'مقدار',
    render: (item) => <span className="font-bold text-lg">{item.value}</span>,
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
    key: 'displayOrder',
    header: 'ترتیب',
    render: (item) => String(item.displayOrder),
  },
];

export default function StatisticsPage() {
  return (
    <AdminLayout title="آمار و ارقام">
      <AdminListPage<Statistic>
        title="آمار و ارقام"
        description="مدیریت آمارهای کلیدی نمایش داده شده در سایت (بازیکنان، قهرمانی‌ها، تجربه و...)"
        addHref="/admin/content/statistics/new"
        addLabel="افزودن آمار"
        columns={columns}
        fetchFn={() => fetchJson<Statistic[]>('/api/admin/content/statistics')}
        deleteFn={(id) => deleteResource(`/api/admin/content/statistics/${id}`)}
        editHref={(item) => `/admin/content/statistics/${item.id}`}
        accent="amber"
        confirmDeleteMessage="آیا از حذف این آمار مطمئن هستید؟"
        emptyMessage="هیچ آ마ری تعریف نشده"
      />
    </AdminLayout>
  );
}