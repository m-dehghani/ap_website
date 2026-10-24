import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { Badge } from '@/components/ui/Badge';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { TableColumn } from '@/components/ui/Table';

interface CTAContent {
  id: string;
  title: string;
  isActive: boolean;
  displayOrder: number;
}

const columns: TableColumn<CTAContent>[] = [
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

export default function CTAContentPage() {
  return (
    <AdminLayout title="محتوی CTA">
      <AdminListPage<CTAContent>
        title="بخش دعوت به اقدام (CTA)"
        description="مدیریت دعوت به اقدام صفحه خانه؛ در هر زمان فقط یک مورد فعال نمایش داده می‌شود."
        addHref="/admin/content/cta-content/new"
        addLabel="افزودن CTA"
        columns={columns}
        fetchFn={() => fetchJson<CTAContent[]>('/api/admin/content/cta-content')}
        deleteFn={(id) => deleteResource(`/api/admin/content/cta-content/${id}`)}
        editHref={(item) => `/admin/content/cta-content/${item.id}`}
        accent="secondary"
        confirmDeleteMessage="آیا از حذف این CTA مطمئن هستید؟"
        emptyMessage="هیچ CTA تعریف نشده"
      />
    </AdminLayout>
  );
}