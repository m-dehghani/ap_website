import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { postJson } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface FormData {
  title: string;
  description: string;
  primaryCTALabel: string;
  primaryCTAHref: string;
  secondaryCTALabel: string;
  secondaryCTAHref: string;
  isActive: boolean;
  displayOrder: number;
}

export default function CTAContentNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    primaryCTALabel: 'شروع ثبت نام',
    primaryCTAHref: '/register',
    secondaryCTALabel: 'رزرو بازدید',
    secondaryCTAHref: '/contact',
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
      await postJson('/api/admin/content/cta-content', formData);
      router.push('/admin/content/cta-content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ایجاد CTA');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="افزودن CTA">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">افزودن بخش CTA جدید</h1>
          <p className="text-gray-600 mt-1">افزودن بخش دعوت به اقدام</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="مثال: آماده شروع سفر فوتبال خود هستید؟"
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
              <label htmlFor="primaryCTALabel" className="block text-sm font-medium text-gray-700 mb-2">
                متن دکمه اصلی *
              </label>
              <Input
                id="primaryCTALabel"
                name="primaryCTALabel"
                value={formData.primaryCTALabel}
                onChange={handleChange}
                required
                placeholder="مثال: همین امروز شروع کنید"
              />
            </div>

            <div>
              <label htmlFor="primaryCTAHref" className="block text-sm font-medium text-gray-700 mb-2">
                لینک دکمه اصلی *
              </label>
              <Input
                id="primaryCTAHref"
                name="primaryCTAHref"
                value={formData.primaryCTAHref}
                onChange={handleChange}
                required
                placeholder="/register"
              />
            </div>

            <div>
              <label htmlFor="secondaryCTALabel" className="block text-sm font-medium text-gray-700 mb-2">
                متن دکمه ثانویه
              </label>
              <Input
                id="secondaryCTALabel"
                name="secondaryCTALabel"
                value={formData.secondaryCTALabel}
                onChange={handleChange}
                placeholder="مثال: رزرو بازدید"
              />
            </div>

            <div>
              <label htmlFor="secondaryCTAHref" className="block text-sm font-medium text-gray-700 mb-2">
                لینک دکمه ثانویه
              </label>
              <Input
                id="secondaryCTAHref"
                name="secondaryCTAHref"
                value={formData.secondaryCTAHref}
                onChange={handleChange}
                placeholder="/contact"
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
              {saving ? 'در حال ذخیره...' : 'ایجاد CTA'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
