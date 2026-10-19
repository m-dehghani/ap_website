import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { Badge } from '@/components/ui/Badge';
import { deleteResource, fetchJson } from '@/lib/api-client';
import { formatToman } from '@/lib/format';
import type { AdminProgramListItem } from '@/types/viewModels/admin';
import type { TableColumn } from '@/components/ui/Table';

const columns: TableColumn<AdminProgramListItem>[] = [
  {
    key: 'name',
    header: 'برنامه',
    render: (program) => (
      <div className="flex items-center">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
          <span className="text-xl">{program.icon}</span>
        </div>
        <div>
          <div className="font-medium text-gray-900">{program.name}</div>
          <div className="text-sm text-gray-500">
            {program.ageRange} • {program.level}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: 'coach',
    header: 'مربی',
    render: (program) =>
      program.coach
        ? `${program.coach.firstName} ${program.coach.lastName}`
        : '—',
  },
  {
    key: 'price',
    header: 'قیمت',
    render: (program) => formatToman(program.price),
  },
  {
    key: 'duration',
    header: 'مدت',
    render: (program) => `${program.duration} ماه`,
  },
  {
    key: 'maxStudents',
    header: 'ظرفیت',
    render: (program) => `${program.maxStudents} نفر`,
  },
  {
    key: 'isActive',
    header: 'وضعیت',
    render: (program) => (
      <div className="flex items-center gap-2">
        <Badge variant={program.isActive ? 'success' : 'default'}>
          {program.isActive ? 'فعال' : 'غیرفعال'}
        </Badge>
        {program.popular && <Badge variant="warning">محبوب</Badge>}
      </div>
    ),
  },
];

export default function ProgramsPage() {
  return (
    <AdminLayout title="مدیریت برنامه‌های آموزشی">
      <AdminListPage
        title="برنامه‌های آموزشی"
        description="مدیریت و مشاهده تمام برنامه‌های آکادمی"
        addHref="/admin/programs/new"
        addLabel="افزودن برنامه جدید"
        columns={columns}
        fetchFn={() => fetchJson<AdminProgramListItem[]>('/api/admin/programs')}
        deleteFn={(id) => deleteResource(`/api/admin/programs/${id}`)}
        editHref={(program) => `/admin/programs/${program.id}`}
        confirmDeleteMessage="آیا از حذف این برنامه مطمئن هستید؟"
        emptyMessage="هیچ برنامه‌ای یافت نشد"
      />
    </AdminLayout>
  );
}
