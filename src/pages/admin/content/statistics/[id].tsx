import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { fetchJson, putJson, deleteResource } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface Statistic {
  id: string;
  key: string;
  value: string;
  label: string;
  description: string | null;
  displayOrder: number;
}

interface FormData {
  key: string;
  value: string;
  label: string;
  description: string;
  displayOrder: number;
}

export default function StatisticEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    key: '',
    value: '',
    label: '',
    description: '',
    displayOrder: 0,
  });

  const fetchData = React.useCallback(async () => {
    try {
      const data = await fetchJson<Statistic>(`/api/admin/content/statistics/${id}`);
      if (data) {
        setFormData({
          key: data.key,
          value: data.value,
          label: data.label,
          description: data.description ?? '',
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
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'displayOrder' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await putJson(`/api/admin/content/statistics/${id}`, formData);
      router.push('/admin/content/statistics');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در به‌روزرسانی');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('آیا از حذف این آمار مطمئن هستید؟')) return;
    setDeleting(true);
    try {
      await deleteResource(`/api/admin/content/statistics/${id}`);
      router.push('/admin/content/statistics');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="ویرایش آمار">
        <div className="bg-white rounded-2xl shadow-lg p-8" role="status" aria-label="در حال بارگذاری">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="ویرایش آمار">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ویرایش آمار</h1>
          <p className="text-gray-600 mt-1">ویرایش آمار کلیدی</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div>
            <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-2">
              کلید (شناسه یکتا) *
            </label>
            <Input
              id="key"
              name="key"
              value={formData.key}
              onChange={handleChange}
              required
              placeholder="مثال: players, championships, experience"
            />
          </div>

          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
              مقدار *
            </label>
            <Input
              id="value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              required
              placeholder="مثال: ۵۰۰+, ۲۵+, ۱۰+"
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
              placeholder="مثال: بازیکن آموزش‌دیده، قهرمانی، سال تجربه"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              توضیح
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="توضیح اضافی برای این آمار (اختیاری)"
            />
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
