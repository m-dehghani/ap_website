import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { Badge } from '@/components/ui/Badge';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { TableColumn } from '@/components/ui/Table';

interface Facility {
  id: string;
  category: string;
  name: string;
  displayOrder: number;
}

const columns: TableColumn<Facility>[] = [
  {
    key: 'category',
    header: 'دسته‌بندی',
    render: (item) => (
      <Badge variant={item.category === 'PITCH' ? 'primary' : 'info'}>
        {item.category === 'PITCH' ? 'زمین تمرین' : 'تجهیزات'}
      </Badge>
    ),
  },
  {
    key: 'name',
    header: 'نام',
  },
  {
    key: 'displayOrder',
    header: 'ترتیب',
    render: (item) => String(item.displayOrder),
  },
];

export default function FacilitiesPage() {
  return (
    <AdminLayout title="امکانات">
      <AdminListPage<Facility>
        title="امکانات"
        description="مدیریت زمین‌های تمرین، تجهیزات و امکانات آکادمی"
        addHref="/admin/content/facilities/new"
        addLabel="افزودن امکانات"
        columns={columns}
        fetchFn={() => fetchJson<Facility[]>('/api/admin/content/facilities')}
        deleteFn={(id) => deleteResource(`/api/admin/content/facilities/${id}`)}
        editHref={(item) => `/admin/content/facilities/${item.id}`}
        accent="orange"
        confirmDeleteMessage="آیا از حذف این امکانات مطمئن هستید؟"
        emptyMessage="هیچ امکاناتی ثبت نشده"
      />
    </AdminLayout>
  );
}