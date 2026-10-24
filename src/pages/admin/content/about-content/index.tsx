import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { Badge } from '@/components/ui/Badge';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { TableColumn } from '@/components/ui/Table';

interface AboutContent {
  id: string;
  section: string;
  title: string;
  isActive: boolean;
  displayOrder: number;
}

const sectionLabels: Record<string, string> = {
  story: 'داستان ما',
  mission: 'ماموریت',
  vision: 'چشم‌انداز',
  values: 'ارزش‌ها',
  team: 'تیم مدیریت',
  facilities: 'امکانات',
  cta: 'دعوت به اقدام',
};

const columns: TableColumn<AboutContent>[] = [
  {
    key: 'section',
    header: 'بخش',
    render: (item) => <Badge variant="primary">{sectionLabels[item.section] ?? item.section}</Badge>,
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

export default function AboutContentPage() {
  return (
    <AdminLayout title="محتویات صفحه درباره ما">
      <AdminListPage<AboutContent>
        title="محتویات صفحه درباره ما"
        description="مدیریت بخش‌های مختلف صفحه درباره ما"
        addHref="/admin/content/about-content/new"
        addLabel="افزودن بخش"
        columns={columns}
        fetchFn={() => fetchJson<AboutContent[]>('/api/admin/content/about-content')}
        deleteFn={(id) => deleteResource(`/api/admin/content/about-content/${id}`)}
        editHref={(item) => `/admin/content/about-content/${item.section}`}
        accent="indigo"
        confirmDeleteMessage="آیا از حذف این بخش مطمئن هستید؟"
        emptyMessage="هیچ بخش تعریف نشده"
      />
    </AdminLayout>
  );
}