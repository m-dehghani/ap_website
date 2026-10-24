import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { TableColumn } from '@/components/ui/Table';

interface NewsCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
  displayOrder: number;
}

const columns: TableColumn<NewsCategory>[] = [
  {
    key: 'slug',
    header: 'اسلاگ',
    render: (item) => <code className="px-2 py-1 bg-gray-100 rounded text-sm">{item.slug}</code>,
  },
  {
    key: 'name',
    header: 'نام',
  },
  {
    key: 'icon',
    header: 'آیکون',
    render: (item) => (
      <span className="text-2xl" aria-hidden="true">{item.icon}</span>
    ),
  },
  {
    key: 'displayOrder',
    header: 'ترتیب',
    render: (item) => String(item.displayOrder),
  },
];

export default function NewsCategoriesPage() {
  return (
    <AdminLayout title="دسته‌بندی اخبار">
      <AdminListPage<NewsCategory>
        title="دسته‌بندی اخبار"
        description="مدیریت دسته‌بندی‌های مختلف برای اخبار و رویدادها"
        addHref="/admin/content/news-categories/new"
        addLabel="افزودن دسته‌بندی"
        columns={columns}
        fetchFn={() => fetchJson<NewsCategory[]>('/api/admin/content/news-categories')}
        deleteFn={(id) => deleteResource(`/api/admin/content/news-categories/${id}`)}
        editHref={(item) => `/admin/content/news-categories/${item.id}`}
        accent="cyan"
        confirmDeleteMessage="آیا از حذف این دسته‌بندی مطمئن هستید؟"
        emptyMessage="هیچ دسته‌بندی ثبت نشده"
      />
    </AdminLayout>
  );
}