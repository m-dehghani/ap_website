import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { fetchJson, putJson, deleteResource } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface HeroAchievement {
  id: string;
  icon: string;
  number: string;
  label: string;
  color: string;
  bg: string;
  position: string;
  isActive: boolean;
  displayOrder: number;
}

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

export default function HeroAchievementEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    icon: '',
    number: '',
    label: '',
    color: '',
    bg: '',
    position: '',
    isActive: true,
    displayOrder: 0,
  });

  const fetchData = React.useCallback(async () => {
    try {
      const data = await fetchJson<HeroAchievement>(`/api/admin/content/hero-achievements/${id}`);
      if (data) {
        setFormData({
          icon: data.icon,
          number: data.number,
          label: data.label,
          color: data.color,
          bg: data.bg,
          position: data.position,
          isActive: data.isActive,
          displayOrder: data.displayOrder,
        });
      }
    } catch (err) {
      setError('خطا در بارگذاری داده‌ها');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && typeof id === 'string') {
      void Promise.resolve().then(fetchData);
    }
  }, [fetchData, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      await putJson(`/api/admin/content/hero-achievements/${id}`, formData);
      router.push('/admin/content/hero-achievements');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در به‌روزرسانی');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('آیا از حذف این دستاورد مطمئن هستید؟')) return;
    setDeleting(true);
    try {
      await deleteResource(`/api/admin/content/hero-achievements/${id}`);
      router.push('/admin/content/hero-achievements');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="ویرایش دستاورد هیرو">
        <div className="bg-white rounded-2xl shadow-lg p-8" role="status" aria-label="در حال بارگذاری">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="ویرایش دستاورد هیرو">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ویرایش دستاورد هیرو</h1>
          <p className="text-gray-600 mt-1">ویرایش نشان دستاورد</p>
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
            <Button type="button" variant="outline" onClick={handleDelete} disabled={deleting} className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
              {deleting ? 'در حال حذف...' : 'حذف'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              انصراف
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
