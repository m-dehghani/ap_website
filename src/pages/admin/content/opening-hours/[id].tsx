import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { fetchJson, putJson, deleteResource } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface OpeningHour {
  id: string;
  type: string;
  days: string;
  hours: string;
  displayOrder: number;
}

interface FormData {
  type: string;
  days: string;
  hours: string;
  displayOrder: number;
}

export default function OpeningHourEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    type: 'OFFICE',
    days: '',
    hours: '',
    displayOrder: 0,
  });

  const fetchData = React.useCallback(async () => {
    try {
      const data = await fetchJson<OpeningHour>(`/api/admin/content/opening-hours/${id}`);
      if (data) {
        setFormData({
          type: data.type,
          days: data.days,
          hours: data.hours,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      await putJson(`/api/admin/content/opening-hours/${id}`, formData);
      router.push('/admin/content/opening-hours');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در به‌روزرسانی');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('آیا از حذف این ساعت کاری مطمئن هستید؟')) return;
    setDeleting(true);
    try {
      await deleteResource(`/api/admin/content/opening-hours/${id}`);
      router.push('/admin/content/opening-hours');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="ویرایش ساعت کاری">
        <div className="bg-white rounded-2xl shadow-lg p-8" role="status" aria-label="در حال بارگذاری">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="ویرایش ساعت کاری">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ویرایش ساعت کاری</h1>
          <p className="text-gray-600 mt-1">ویرایش ساعات اداری یا تمرینی آکادمی</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              نوع *
            </label>
            <Select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              options={[
                { value: 'OFFICE', label: 'اداری' },
                { value: 'TRAINING', label: 'تمرینی' },
              ]}
            />
          </div>

          <div>
            <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-2">
              روزها *
            </label>
            <Input
              id="days"
              name="days"
              value={formData.days}
              onChange={handleChange}
              required
              placeholder="مثال: شنبه تا چهارشنبه"
            />
          </div>

          <div>
            <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-2">
              ساعات *
            </label>
            <Input
              id="hours"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              required
              placeholder="مثال: 8:00 - 22:00"
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
