import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { postJson } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface FormData {
  icon: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  iconColor: string;
  stats: string;
  isActive: boolean;
  displayOrder: number;
}

export default function FeaturesContentNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    icon: '',
    title: '',
    description: '',
    color: 'from-accent-500 to-accent-600',
    bgColor: 'bg-accent-50',
    iconColor: 'text-accent-600',
    stats: '',
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
      await postJson('/api/admin/content/features-content', formData);
      router.push('/admin/content/features-content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ایجاد ویژگی');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="افزودن ویژگی">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">افزودن ویژگی جدید</h1>
          <p className="text-gray-600 mt-1">افزودن کارت ویژگی برای صفحه خانه</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="مثال: TrophyIcon"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                عنوان *
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="مثال: مربیگری متخصص"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                توضیحات *
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="توضیحات کامل..."
              />
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                رنگ گرادیان
              </label>
              <Input
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="from-accent-500 to-accent-600"
              />
            </div>

            <div>
              <label htmlFor="bgColor" className="block text-sm font-medium text-gray-700 mb-2">
                رنگ پس‌زمینه آیکون
              </label>
              <Input
                id="bgColor"
                name="bgColor"
                value={formData.bgColor}
                onChange={handleChange}
                placeholder="bg-accent-50"
              />
            </div>

            <div>
              <label htmlFor="iconColor" className="block text-sm font-medium text-gray-700 mb-2">
                رنگ آیکون
              </label>
              <Input
                id="iconColor"
                name="iconColor"
                value={formData.iconColor}
                onChange={handleChange}
                placeholder="text-accent-600"
              />
            </div>

            <div>
              <label htmlFor="stats" className="block text-sm font-medium text-gray-700 mb-2">
                آمار (متن کوتاه)
              </label>
              <Input
                id="stats"
                name="stats"
                value={formData.stats}
                onChange={handleChange}
                placeholder="مثال: ۱۲+ مربی"
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
              {saving ? 'در حال ذخیره...' : 'ایجاد ویژگی'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
