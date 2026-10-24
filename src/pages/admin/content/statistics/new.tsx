import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { postJson } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface FormData {
  key: string;
  value: string;
  label: string;
  description: string;
  displayOrder: number;
}

export default function StatisticNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    key: '',
    value: '',
    label: '',
    description: '',
    displayOrder: 0,
  });

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
      await postJson('/api/admin/content/statistics', formData);
      router.push('/admin/content/statistics');
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
          <p className="text-gray-600 mt-1">تعریف آمار کلیدی برای نمایش در سایت</p>
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