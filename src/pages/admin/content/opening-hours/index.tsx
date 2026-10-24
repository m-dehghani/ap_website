import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { Badge } from '@/components/ui/Badge';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { TableColumn } from '@/components/ui/Table';

interface OpeningHour {
  id: string;
  type: string;
  days: string;
  hours: string;
  displayOrder: number;
}

const columns: TableColumn<OpeningHour>[] = [
  {
    key: 'type',
    header: 'نوع',
    render: (item) => (
      <Badge variant={item.type === 'OFFICE' ? 'primary' : 'success'}>
        {item.type === 'OFFICE' ? 'اداری' : 'تمرینی'}
      </Badge>
    ),
  },
  {
    key: 'days',
    header: 'روزها',
  },
  {
    key: 'hours',
    header: 'ساعات',
  },
  {
    key: 'displayOrder',
    header: 'ترتیب',
    render: (item) => String(item.displayOrder),
  },
];

export default function OpeningHoursPage() {
  return (
    <AdminLayout title="ساعات کاری">
      <AdminListPage<OpeningHour>
        title="ساعات کاری"
        description="مدیریت ساعات اداری و تمرینی آکادمی"
        addHref="/admin/content/opening-hours/new"
        addLabel="افزودن ساعات کاری"
        columns={columns}
        fetchFn={() => fetchJson<OpeningHour[]>('/api/admin/content/opening-hours')}
        deleteFn={(id) => deleteResource(`/api/admin/content/opening-hours/${id}`)}
        editHref={(item) => `/admin/content/opening-hours/${item.id}`}
        accent="secondary"
        confirmDeleteMessage="آیا از حذف این ساعت کاری مطمئن هستید؟"
        emptyMessage="هیچ ساعتی تعریف نشده"
      />
    </AdminLayout>
  );
}