import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { fetchJson, putJson, deleteResource } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

interface AboutContent {
  id: string;
  section: string;
  title: string;
  content: Record<string, any>;
  isActive: boolean;
  displayOrder: number;
}

interface FormData {
  section: string;
  title: string;
  content: string;
  isActive: boolean;
  displayOrder: number;
}

export default function AboutContentEditPage() {
  const router = useRouter();
  const { section } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    section: '',
    title: '',
    content: '{}',
    isActive: true,
    displayOrder: 0,
  });

  const fetchData = React.useCallback(async () => {
    try {
      const data = await fetchJson<AboutContent>(`/api/admin/content/about-content/${section}`);
      if (data) {
        setFormData({
          section: data.section,
          title: data.title,
          content: JSON.stringify(data.content, null, 2),
          isActive: data.isActive,
          displayOrder: data.displayOrder,
        });
      }
    } catch (err) {
      setError('خطا در بارگذاری داده‌ها');
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    if (section && typeof section === 'string') {
      void Promise.resolve().then(fetchData);
    }
  }, [fetchData, section]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      let contentObj: Record<string, any> = {};
      try {
        contentObj = JSON.parse(formData.content);
      } catch {
        throw new Error('فرمت JSON برای content نادرست است');
      }
      await putJson(`/api/admin/content/about-content/${section}`, {
        ...formData,
        content: contentObj,
      });
      router.push('/admin/content/about-content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در به‌روزرسانی');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('آیا از حذف این بخش مطمئن هستید؟')) return;
    setDeleting(true);
    try {
      await deleteResource(`/api/admin/content/about-content/${section}`);
      router.push('/admin/content/about-content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="ویرایش بخش درباره ما">
        <div className="bg-white rounded-2xl shadow-lg p-8" role="status" aria-label="در حال بارگذاری">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="ویرایش بخش درباره ما">
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ویرایش بخش درباره ما</h1>
          <p className="text-gray-600 mt-1">ویرایش بخش‌های صفحه درباره ما</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">بخش</label>
              <Select
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                options={[
                  { value: 'story', label: 'داستان ما' },
                  { value: 'mission', label: 'ماموریت' },
                  { value: 'vision', label: 'چشم‌انداز' },
                  { value: 'values', label: 'ارزش‌ها' },
                  { value: 'team', label: 'تیم مدیریت' },
                  { value: 'facilities', label: 'امکانات' },
                  { value: 'cta', label: 'دعوت به اقدام (CTA)' },
                ]}
                disabled
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
                placeholder="مثال: داستان ما"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                محتوا (JSON) *
              </label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={10}
                placeholder='{"paragraphs": ["..."], "mission": {"title": "...", "description": "..."}}'
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
