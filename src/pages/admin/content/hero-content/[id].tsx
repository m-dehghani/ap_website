import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { fetchJson, putJson, deleteResource } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface HeroContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  bgGradient: string;
  stats: Record<string, string>;
  statLabels: Record<string, string>;
  isActive: boolean;
  displayOrder: number;
}

interface FormData {
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  bgGradient: string;
  stats: string;
  statLabels: string;
  isActive: boolean;
  displayOrder: number;
}

export default function HeroContentEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    subtitle: '',
    description: '',
    ctaLabel: '',
    ctaHref: '',
    ctaSecondaryLabel: '',
    ctaSecondaryHref: '',
    bgGradient: '',
    stats: '{}',
    statLabels: '{}',
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
      const data = await fetchJson<HeroContent>(`/api/admin/content/hero-content/${id}`);
      if (data) {
        setFormData({
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          ctaLabel: data.ctaLabel,
          ctaHref: data.ctaHref,
          ctaSecondaryLabel: data.ctaSecondaryLabel,
          ctaSecondaryHref: data.ctaSecondaryHref,
          bgGradient: data.bgGradient,
          stats: JSON.stringify(data.stats, null, 2),
          statLabels: JSON.stringify(data.statLabels, null, 2),
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
      let statsObj: Record<string, string> = {};
      let statLabelsObj: Record<string, string> = {};
      try {
        statsObj = JSON.parse(formData.stats);
        statLabelsObj = JSON.parse(formData.statLabels);
      } catch {
        throw new Error('فرمت JSON برای stats یا statLabels نادرست است');
      }
      await putJson(`/api/admin/content/hero-content/${id}`, {
        ...formData,
        stats: statsObj,
        statLabels: statLabelsObj,
      });
      router.push('/admin/content/hero-content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در به‌روزرسانی');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('آیا از حذف این اسلایدر مطمئن هستید؟')) return;
    setDeleting(true);
    try {
      await deleteResource(`/api/admin/content/hero-content/${id}`);
      router.push('/admin/content/hero-content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="ویرایش اسلایدر هیرو">
        <div className="bg-white rounded-2xl shadow-lg p-8" role="status" aria-label="در حال بارگذاری">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="ویرایش اسلایدر هیرو">
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ویرایش اسلایدر هیرو</h1>
          <p className="text-gray-600 mt-1">ویرایش اسلایدر صفحه خانه</p>
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
                placeholder="مثال: آکادمی فوتبال AP"
              />
            </div>

            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                زیرعنوان *
              </label>
              <Input
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                required
                placeholder="مثال: جایی که قهرمانان ساخته می‌شوند"
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
              <label htmlFor="ctaLabel" className="block text-sm font-medium text-gray-700 mb-2">
                متن دکمه اصلی (CTA)
              </label>
              <Input
                id="ctaLabel"
                name="ctaLabel"
                value={formData.ctaLabel}
                onChange={handleChange}
                placeholder="مثال: شروع ثبت نام"
              />
            </div>

            <div>
              <label htmlFor="ctaHref" className="block text-sm font-medium text-gray-700 mb-2">
                لینک دکمه اصلی (CTA)
              </label>
              <Input
                id="ctaHref"
                name="ctaHref"
                value={formData.ctaHref}
                onChange={handleChange}
                placeholder="/register"
              />
            </div>

            <div>
              <label htmlFor="ctaSecondaryLabel" className="block text-sm font-medium text-gray-700 mb-2">
                متن دکمه ثانویه
              </label>
              <Input
                id="ctaSecondaryLabel"
                name="ctaSecondaryLabel"
                value={formData.ctaSecondaryLabel}
                onChange={handleChange}
                placeholder="مثال: داستان ما"
              />
            </div>

            <div>
              <label htmlFor="ctaSecondaryHref" className="block text-sm font-medium text-gray-700 mb-2">
                لینک دکمه ثانویه
              </label>
              <Input
                id="ctaSecondaryHref"
                name="ctaSecondaryHref"
                value={formData.ctaSecondaryHref}
                onChange={handleChange}
                placeholder="/about"
              />
            </div>

            <div>
              <label htmlFor="bgGradient" className="block text-sm font-medium text-gray-700 mb-2">
                گرادیان پس‌زمینه (Tailwind classes)
              </label>
              <Input
                id="bgGradient"
                name="bgGradient"
                value={formData.bgGradient}
                onChange={handleChange}
                placeholder="from-navy-950 via-blue-900 to-blue-700"
              />
            </div>

            <div>
              <label htmlFor="stats" className="block text-sm font-medium text-gray-700 mb-2">
                آمارها (JSON) *
              </label>
              <Textarea
                id="stats"
                name="stats"
                value={formData.stats}
                onChange={handleChange}
                required
                rows={4}
                placeholder='{"players": "۵۰۰+", "championships": "۲۵+", "experience": "۱۰+"}'
                className="font-mono text-sm"
              />
            </div>

            <div>
              <label htmlFor="statLabels" className="block text-sm font-medium text-gray-700 mb-2">
                برچسب‌های آمارها (JSON) *
              </label>
              <Textarea
                id="statLabels"
                name="statLabels"
                value={formData.statLabels}
                onChange={handleChange}
                required
                rows={4}
                placeholder='{"players": "بازیکن آموزش‌دیده", "championships": "قهرمانی", "experience": "سال تجربه"}'
                className="font-mono text-sm"
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