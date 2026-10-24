import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { fetchJson, putJson, deleteResource } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface CTAContent {
  id: string;
  title: string;
  description: string;
  primaryCTALabel: string;
  primaryCTAHref: string;
  secondaryCTALabel: string;
  secondaryCTAHref: string;
  isActive: boolean;
  displayOrder: number;
}

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

export default function CTAContentEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    primaryCTALabel: '',
    primaryCTAHref: '',
    secondaryCTALabel: '',
    secondaryCTAHref: '',
    isActive: true,
    displayOrder: 0,
  });

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const data = await fetchJson<CTAContent>(`/api/admin/content/cta-content/${id}`);
      if (data) {
        setFormData({
          title: data.title,
          description: data.description,
          primaryCTALabel: data.primaryCTALabel,
          primaryCTAHref: data.primaryCTAHref,
          secondaryCTALabel: data.secondaryCTALabel,
          secondaryCTAHref: data.secondaryCTAHref,
          isActive: data.isActive,
          displayOrder: data.displayOrder,
        });
      }
    } catch (err) {
      setError('خطا در بارگذاری داده‌ها');
    } finally {
      setLoading(false);
    }
  };

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
      await putJson(`/api/admin/content/cta-content/${id}`, formData);
      router.push('/admin/content/cta-content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در به‌روزرسانی');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('آیا از حذف این CTA مطمئن هستید؟')) return;
    setDeleting(true);
    try {
      await deleteResource(`/api/admin/content/cta-content/${id}`);
      router.push('/admin/content/cta-content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="ویرایش CTA">
        <div className="bg-white rounded-2xl shadow-lg p-8" role="status" aria-label="در حال بارگذاری">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="ویرایش CTA">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ویرایش بخش CTA</h1>
          <p className="text-gray-600 mt-1">ویرایش بخش دعوت به اقدام</p>
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
