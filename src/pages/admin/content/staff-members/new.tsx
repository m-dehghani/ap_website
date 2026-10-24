import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { postJson } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface FormData {
  name: string;
  role: string;
  bio: string;
  initials: string;
  isActive: boolean;
  displayOrder: number;
}

export default function StaffMemberNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: '',
    bio: '',
    initials: '',
    isActive: true,
    displayOrder: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'displayOrder' ? parseInt(value, 10) || 0 : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await postJson('/api/admin/content/staff-members', formData);
      router.push('/admin/content/staff-members');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ایجاد عضو تیم');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="افزودن عضو تیم">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">افزودن عضو تیم جدید</h1>
          <p className="text-gray-600 mt-1">ثبت عضو جدید در تیم مدیریت/مربیگری</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                نام *
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="مثال: علی احمدی"
              />
            </div>

            <div>
              <label htmlFor="initials" className="block text-sm font-medium text-gray-700 mb-2">
                حروف اولیه (برای آواتار) *
              </label>
              <Input
                id="initials"
                name="initials"
                value={formData.initials}
                onChange={handleChange}
                required
                maxLength={3}
                placeholder="مثال: AP"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                نقش *
              </label>
              <Input
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                placeholder="مثال: مدیر عامل و بنیانگذار"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                بیوگرافی *
              </label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                required
                rows={4}
                placeholder="بیوگرافی کوتاه برای نمایش در صفحه درباره ما..."
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">فعال</span>
              </label>
            </div>

            <div>
              <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-2">
                ترتیب نمایش
              </label>
              <Input
                id="displayOrder"
                name="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={handleChange}
                min={0}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 space-x-reverse pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              انصراف
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'در حال ذخیره...' : 'ایجاد عضو تیم'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}