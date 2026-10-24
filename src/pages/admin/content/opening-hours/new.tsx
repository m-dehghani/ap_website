import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { postJson } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface FormData {
  type: string;
  days: string;
  hours: string;
  displayOrder: number;
}

export default function OpeningHourNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    type: 'OFFICE',
    days: '',
    hours: '',
    displayOrder: 0,
  });

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
      await postJson('/api/admin/content/opening-hours', formData);
      router.push('/admin/content/opening-hours');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ایجاد ساعت کاری');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="افزودن ساعت کاری">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">افزودن ساعت کاری جدید</h1>
          <p className="text-gray-600 mt-1">تعریف ساعات اداری یا تمرینی آکادمی</p>
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
            <Button type="button" variant="outline" onClick={() => router.back()}>
              انصراف
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'در حال ذخیره...' : 'ایجاد ساعت کاری'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}