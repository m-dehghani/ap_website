import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { Badge } from '@/components/ui/Badge';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { AdminCoachListItem } from '@/types/viewModels/admin';
import type { TableColumn } from '@/components/ui/Table';
import ProfileAvatar from '@/components/ProfileAvatar';

const columns: TableColumn<AdminCoachListItem>[] = [
  {
    key: 'name',
    header: 'مربی',
    render: (coach) => (
      <div className="flex items-center">
        <div className="mr-3">
          <ProfileAvatar
            image={coach.image}
            initials={`${coach.firstName.charAt(0)}${coach.lastName.charAt(0)}`.toUpperCase()}
            size={40}
          />
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {coach.firstName} {coach.lastName}
          </div>
          <div className="text-sm text-gray-500">{coach.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'specialization',
    header: 'تخصص',
  },
  {
    key: 'experience',
    header: 'تجربه',
    render: (coach) => `${coach.experience} سال`,
  },
  {
    key: 'programs',
    header: 'برنامه‌ها',
    render: (coach) => `${coach.programs.length} برنامه`,
  },
  {
    key: 'rating',
    header: 'امتیاز',
  },
  {
    key: 'studentsCount',
    header: 'دانش‌آموزان',
  },
  {
    key: 'isActive',
    header: 'وضعیت',
    render: (coach) => (
      <Badge variant={coach.isActive ? 'success' : 'default'}>
        {coach.isActive ? 'فعال' : 'غیرفعال'}
      </Badge>
    ),
  },
];

export default function CoachesPage() {
  return (
    <AdminLayout title="مدیریت مربیان">
      <AdminListPage
        title="مربیان"
        description="مدیریت و مشاهده تمام مربیان آکادمی"
        addHref="/admin/coaches/new"
        addLabel="افزودن مربی جدید"
        columns={columns}
        fetchFn={() => fetchJson<AdminCoachListItem[]>('/api/admin/coaches')}
        deleteFn={(id) => deleteResource(`/api/admin/coaches/${id}`)}
        editHref={(coach) => `/admin/coaches/${coach.id}`}
        accent="emerald"
        confirmDeleteMessage="آیا از حذف این مربی مطمئن هستید؟"
        emptyMessage="هیچ مربیی یافت نشد"
      />
    </AdminLayout>
  );
}
