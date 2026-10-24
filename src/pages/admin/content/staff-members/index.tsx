import AdminLayout from '@/components/AdminLayout';
import { AdminListPage } from '@/components/admin/AdminListPage';
import { Badge } from '@/components/ui/Badge';
import { deleteResource, fetchJson } from '@/lib/api-client';
import type { TableColumn } from '@/components/ui/Table';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  isActive: boolean;
  displayOrder: number;
}

const columns: TableColumn<StaffMember>[] = [
  {
    key: 'initials',
    header: '',
    render: (item) => (
      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
        {item.initials}
      </div>
    ),
  },
  {
    key: 'name',
    header: 'نام',
  },
  {
    key: 'role',
    header: 'نقش',
  },
  {
    key: 'bio',
    header: 'بیوگرافی',
    render: (item) => (
      <span className="max-w-xs truncate block">{item.bio}</span>
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

export default function StaffMembersPage() {
  return (
    <AdminLayout title="اعضای تیم">
      <AdminListPage<StaffMember>
        title="اعضای تیم"
        description="مدیریت اعضای تیم مدیریت و مربیان ارشد"
        addHref="/admin/content/staff-members/new"
        addLabel="افزودن عضو تیم"
        columns={columns}
        fetchFn={() => fetchJson<StaffMember[]>('/api/admin/content/staff-members')}
        deleteFn={(id) => deleteResource(`/api/admin/content/staff-members/${id}`)}
        editHref={(item) => `/admin/content/staff-members/${item.id}`}
        accent="teal"
        confirmDeleteMessage="آیا از حذف این عضو تیم مطمئن هستید؟"
        emptyMessage="هیچ عضوی ثبت نشده"
      />
    </AdminLayout>
  );
}