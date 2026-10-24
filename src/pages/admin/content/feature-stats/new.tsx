import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { postJson } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface FormData {
  number: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  displayOrder: number;
}

export default function FeatureStatNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    number: '',
    label: '',
    description: '',
    icon: 'TrophyIcon',
    color: 'text-primary-600',
    isActive: true,
    displayOrder: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const nextValue =
      e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
        ? e.target.checked
        : name === 'displayOrder'
          ? parseInt(value, 10) || 0
          : value;
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await postJson('/api/admin/content/feature-stats', formData);
      router.push('/admin/content/feature-stats');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ایجاد آمار');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="افزودن آمار">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">افزودن آمار جدید</h1>
          <p className="text-gray-600 mt-1">افزودن آمار متحرک برای بخش ویژگی‌ها</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
                شماره *
              </label>
              <Input
                id="number"
                name="number"
                value={formData.number}
                onChange={handleChange}
                required
                placeholder="مثال: ۵۰۰+"
              />
            </div>

            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-2">
                برچسب *
              </label>
              <Input
                id="label"
                name="label"
                value={formData.label}
                onChange={handleChange}
                required
                placeholder="مثال: بازیکن فعال"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                توضیح
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="مثال: تعداد بازیکنان فعال در آکادمی"
              />
            </div>

            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
                آیکون *
              </label>
              <Input
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                required
                placeholder="مثال: UserGroupIcon"
              />
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                رنگ متن
              </label>
              <Input
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="text-primary-600"
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
              {saving ? 'در حال ذخیره...' : 'ایجاد آمار'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
