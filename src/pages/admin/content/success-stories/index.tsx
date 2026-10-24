import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { Badge } from '@/components/ui/Badge';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { TableColumn } from '@/components/ui/Table';

interface SuccessStory {
  id: string;
  playerName: string;
  age: number;
  achievement: string;
  description: string;
  quote: string | null;
  image: string | null;
  date: string;
  goals: number;
  assists: number;
  matches: number;
  isPublished: boolean;
  displayOrder: number;
  program: { name: string } | null;
  coach: { firstName: string; lastName: string } | null;
}

const columns: TableColumn<SuccessStory>[] = [
  {
    key: 'playerName',
    header: 'بازیکن',
    render: (item) => (
      <div>
        <div className="font-medium text-gray-900">{item.playerName}</div>
        <div className="text-sm text-gray-500">{item.age} ساله</div>
      </div>
    ),
  },
  {
    key: 'achievement',
    header: 'دستاورد',
  },
  {
    key: 'program',
    header: 'برنامه',
    render: (item) => item.program?.name ?? <span className="text-gray-400">—</span>,
  },
  {
    key: 'coach',
    header: 'مربی',
    render: (item) =>
      item.coach
        ? `${item.coach.firstName} ${item.coach.lastName}`
        : <span className="text-gray-400">—</span>,
  },
  {
    key: 'stats',
    header: 'آمار',
    render: (item) => `${item.goals} گل، ${item.assists} Asistencia، ${item.matches} بازی`,
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

export default function SuccessStoriesPage() {
  return (
    <AdminLayout title="داستان‌های موفقیت">
      <AdminListPage<SuccessStory>
        title="داستان‌های موفقیت"
        description="مدیریت داستان‌های پیشرفت بازیکنان و انتقال به باشگاه‌ها"
        addHref="/admin/content/success-stories/new"
        addLabel="افزودن داستان موفقیت"
        columns={columns}
        fetchFn={() => fetchJson<SuccessStory[]>('/api/admin/content/success-stories')}
        deleteFn={(id) => deleteResource(`/api/admin/content/success-stories/${id}`)}
        editHref={(item) => `/admin/content/success-stories/${item.id}`}
        accent="red"
        confirmDeleteMessage="آیا از حذف این داستان موفقیت مطمئن هستید؟"
        emptyMessage="هیچ داستان موفقیت ثبت نشده"
      />
    </AdminLayout>
  );
}