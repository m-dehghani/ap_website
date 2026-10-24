import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { Badge } from '@/components/ui/Badge';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { TableColumn } from '@/components/ui/Table';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image: string | null;
  rating: number;
  category: string;
  improvement: string | null;
  date: string | null;
  isPublished: boolean;
  displayOrder: number;
  program: { name: string } | null;
}

const columns: TableColumn<Testimonial>[] = [
  {
    key: 'name',
    header: 'نام',
    render: (item) => (
      <div>
        <div className="font-medium text-gray-900">{item.name}</div>
        <div className="text-sm text-gray-500">{item.role}</div>
      </div>
    ),
  },
  {
    key: 'category',
    header: 'دسته',
    render: (item) => (
      <Badge variant={item.category === 'SUCCESS' ? 'warning' : 'primary'}>
        {item.category === 'SUCCESS' ? 'موفقیت' : 'عمومی'}
      </Badge>
    ),
  },
  {
    key: 'rating',
    header: 'امتیاز',
    render: (item) => '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating),
  },
  {
    key: 'program',
    header: 'برنامه',
    render: (item) => item.program?.name ?? <span className="text-gray-400">—</span>,
  },
  {
    key: 'isPublished',
    header: 'وضعیت',
    render: (item) => (
      <Badge variant={item.isPublished ? 'success' : 'default'}>
        {item.isPublished ? 'منتشر شده' : 'پیش‌نویس'}
      </Badge>
    ),
  },
  {
    key: 'displayOrder',
    header: 'ترتیب',
    render: (item) => String(item.displayOrder),
  },
];

export default function TestimonialsPage() {
  return (
    <AdminLayout title="نظرات کاربران">
      <AdminListPage<Testimonial>
        title="نظرات کاربران"
        description="مدیریت نظرات و توصیه‌های دانش‌آموزان و والدین"
        addHref="/admin/content/testimonials/new"
        addLabel="افزودن نظر"
        columns={columns}
        fetchFn={() => fetchJson<Testimonial[]>('/api/admin/content/testimonials')}
        deleteFn={(id) => deleteResource(`/api/admin/content/testimonials/${id}`)}
        editHref={(item) => `/admin/content/testimonials/${item.id}`}
        accent="purple"
        confirmDeleteMessage="آیا از حذف این نظر مطمئن هستید؟"
        emptyMessage="هیچ نظری ثبت نشده"
      />
    </AdminLayout>
  );
}