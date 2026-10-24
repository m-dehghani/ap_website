import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { postJson } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface FormData {
  icon: string;
  number: string;
  label: string;
  color: string;
  bg: string;
  position: string;
  isActive: boolean;
  displayOrder: number;
}

export default function HeroAchievementNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    icon: 'TrophyIcon',
    number: '',
    label: '',
    color: 'text-gold-400',
    bg: 'bg-gold-400/20',
    position: 'top-6 -left-6',
    isActive: true,
    displayOrder: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextValue =
      e.target.type === 'checkbox'
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
      await postJson('/api/admin/content/hero-achievements', formData);
      router.push('/admin/content/hero-achievements');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ایجاد دستاورد');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="افزودن دستاورد هیرو">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">افزودن دستاورد هیرو جدید</h1>
          <p className="text-gray-600 mt-1">افزودن نشان دستاورد برای اسلایدر اصلی</p>
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
                آیکون (نام کامپوننت) *
              </label>
              <Input
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                required
                placeholder="مثال: TrophyIcon, StarIcon, UsersIcon"
              />
            </div>

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
                placeholder="مثال: ۲۵+"
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
                placeholder="مثال: قهرمانی"
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
                placeholder="text-gold-400"
              />
            </div>

            <div>
              <label htmlFor="bg" className="block text-sm font-medium text-gray-700 mb-2">
                رنگ پس‌زمینه
              </label>
              <Input
                id="bg"
                name="bg"
                value={formData.bg}
                onChange={handleChange}
                placeholder="bg-gold-400/20"
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                موقعیت (Tailwind classes)
              </label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="top-6 -left-6"
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
              {saving ? 'در حال ذخیره...' : 'ایجاد دستاورد'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
