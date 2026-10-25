import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { TableColumn } from '@/components/ui/Table';

interface Milestone {
  id: string;
  year: number;
  title: string;
  description: string;
  displayOrder: number;
}

const columns: TableColumn<Milestone>[] = [
  {
    key: 'year',
    header: 'سال (شمسی)',
    render: (item) => String(item.year),
  },
  {
    key: 'title',
    header: 'عنوان',
  },
  {
    key: 'description',
    header: 'توضیحات',
    render: (item) => (
      <span className="max-w-xs truncate block">{item.description}</span>
    ),
  },
  {
    key: 'displayOrder',
    header: 'ترتیب',
    render: (item) => String(item.displayOrder),
  },
];

export default function MilestonesPage() {
  return (
    <AdminLayout title="مراحل مهم">
      <AdminListPage<Milestone>
        title="مراحل مهم"
        description="مدیریت رویدادهای کلیدی در تاریخچه آکادمی"
        addHref="/admin/content/milestones/new"
        addLabel="افزودن رویداد"
        columns={columns}
        fetchFn={() => fetchJson<Milestone[]>('/api/admin/content/milestones')}
        deleteFn={(id) => deleteResource(`/api/admin/content/milestones/${id}`)}
        editHref={(item) => `/admin/content/milestones/${item.id}`}
        accent="primary"
        confirmDeleteMessage="آیا از حذف این رویداد مطمئن هستید؟"
        emptyMessage="هیچ رویدادی ثبت نشده"
      />
    </AdminLayout>
  );
}