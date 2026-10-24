import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { Badge } from '@/components/ui/Badge';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { TableColumn } from '@/components/ui/Table';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  type: string;
  author: string;
  image: string | null;
  tags: string[];
  readTimeMinutes: number;
  likes: number;
  comments: number;
  featured: boolean;
  isPublished: boolean;
  publishedAt: string;
}

const columns: TableColumn<NewsArticle>[] = [
  {
    key: 'title',
    header: 'عنوان',
    render: (item) => (
      <div className="max-w-xs truncate font-medium text-gray-900">{item.title}</div>
    ),
  },
  {
    key: 'category',
    header: 'دسته',
    render: (item) => (
      <Badge variant="primary">{item.category}</Badge>
    ),
  },
  {
    key: 'type',
    header: 'نوع',
    render: (item) => {
      const types: Record<string, string> = {
        NEWS: 'خبر',
        VIDEO: 'ویدئو',
        GALLERY: 'گالری',
      };
      return <Badge variant="info">{types[item.type] ?? item.type}</Badge>;
    },
  },
  {
    key: 'author',
    header: 'نویسنده',
  },
  {
    key: 'featured',
    header: 'ویژه',
    render: (item) => (
      <Badge variant={item.featured ? 'warning' : 'default'}>
        {item.featured ? '⭐ بله' : 'خیر'}
      </Badge>
    ),
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
    key: 'publishedAt',
    header: 'تاریخ انتشار',
    render: (item) => item.publishedAt.slice(0, 10),
  },
];

export default function NewsArticlesPage() {
  return (
    <AdminLayout title="مقالات و اخبار">
      <AdminListPage<NewsArticle>
        title="مقالات و اخبار"
        description="مدیریت اخبار، ویدئوها و گالری‌های تصویری"
        addHref="/admin/content/news-articles/new"
        addLabel="افزودن مقاله/خبر"
        columns={columns}
        fetchFn={() => fetchJson<NewsArticle[]>('/api/admin/content/news-articles')}
        deleteFn={(id) => deleteResource(`/api/admin/content/news-articles/${id}`)}
        editHref={(item) => `/admin/content/news-articles/${item.id}`}
        accent="rose"
        confirmDeleteMessage="آیا از حذف این مقاله/خبر مطمئن هستید؟"
        emptyMessage="هیچ مقاله/خبری ثبت نشده"
      />
    </AdminLayout>
  );
}