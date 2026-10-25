import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { fetchJson, putJson, deleteResource } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface FeaturesContent {
  id: string;
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

export default function FeaturesContentEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    icon: '',
    title: '',
    description: '',
    color: '',
    bgColor: '',
    iconColor: '',
    stats: '',
    isActive: true,
    displayOrder: 0,
  });

  const fetchData = React.useCallback(async () => {
    try {
      const data = await fetchJson<FeaturesContent>(`/api/admin/content/features-content/${id}`);
      if (data) {
        setFormData({
          icon: data.icon,
          title: data.title,
          description: data.description,
          color: data.color,
          bgColor: data.bgColor,
          iconColor: data.iconColor,
          stats: data.stats,
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
      await putJson(`/api/admin/content/features-content/${id}`, formData);
      router.push('/admin/content/features-content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در به‌روزرسانی');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('آیا از حذف این ویژگی مطمئن هستید؟')) return;
    setDeleting(true);
    try {
      await deleteResource(`/api/admin/content/features-content/${id}`);
      router.push('/admin/content/features-content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="ویرایش ویژگی">
        <div className="bg-white rounded-2xl shadow-lg p-8" role="status" aria-label="در حال بارگذاری">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="ویرایش ویژگی">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ویرایش ویژگی</h1>
          <p className="text-gray-600 mt-1">ویرایش کارت ویژگی صفحه خانه</p>
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
