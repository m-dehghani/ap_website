import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { Badge } from '@/components/ui/Badge';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { TableColumn } from '@/components/ui/Table';

interface SocialLink {
  id: string;
  platform: string;
  name: string;
  url: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
}

const columns: TableColumn<SocialLink>[] = [
  {
    key: 'platform',
    header: 'پلتفرم',
    render: (item) => (
      <span className="inline-flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">{item.icon}</span>
        <span className="font-medium capitalize">{item.platform}</span>
      </span>
    ),
  },
  {
    key: 'name',
    header: 'نام',
  },
  {
    key: 'url',
    header: 'لینک',
    render: (item) => (
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline truncate block max-w-xs">
        {item.url}
      </a>
    ),
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

export default function SocialLinksPage() {
  return (
    <AdminLayout title="شبکه‌های اجتماعی">
      <AdminListPage<SocialLink>
        title="شبکه‌های اجتماعی"
        description="مدیریت لینک‌های شبکه‌های اجتماعی در فوتر و هدر سایت"
        addHref="/admin/content/social-links/new"
        addLabel="افزودن شبکه اجتماعی"
        columns={columns}
        fetchFn={() => fetchJson<SocialLink[]>('/api/admin/content/social-links')}
        deleteFn={(id) => deleteResource(`/api/admin/content/social-links/${id}`)}
        editHref={(item) => `/admin/content/social-links/${item.id}`}
        accent="emerald"
        confirmDeleteMessage="آیا از حذف این شبکه اجتماعی مطمئن هستید؟"
        emptyMessage="هیچ شبکه اجتماعی تعریف نشده"
      />
    </AdminLayout>
  );
}