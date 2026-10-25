import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { fetchJson, putJson, deleteResource } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface SocialLink {
  id: string;
  platform: string;
  name: string;
  url: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
}

interface FormData {
  platform: string;
  name: string;
  url: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
}

export default function SocialLinkEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    platform: 'instagram',
    name: '',
    url: '',
    icon: '',
    isActive: true,
    displayOrder: 0,
  });

  const fetchData = React.useCallback(async () => {
    try {
      const data = await fetchJson<SocialLink>(`/api/admin/content/social-links/${id}`);
      if (data) {
        setFormData({
          platform: data.platform,
          name: data.name,
          url: data.url,
          icon: data.icon,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      await putJson(`/api/admin/content/social-links/${id}`, formData);
      router.push('/admin/content/social-links');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در به‌روزرسانی');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('آیا از حذف این شبکه اجتماعی مطمئن هستید؟')) return;
    setDeleting(true);
    try {
      await deleteResource(`/api/admin/content/social-links/${id}`);
      router.push('/admin/content/social-links');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="ویرایش شبکه اجتماعی">
        <div className="bg-white rounded-2xl shadow-lg p-8" role="status" aria-label="در حال بارگذاری">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="ویرایش شبکه اجتماعی">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ویرایش شبکه اجتماعی</h1>
          <p className="text-gray-600 mt-1">ویرایش لینک شبکه اجتماعی</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
              پلتفرم *
            </label>
            <Select
              id="platform"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              required
              options={[
                { value: 'instagram', label: 'اینستاگرام' },
                { value: 'telegram', label: 'تلگرام' },
                { value: 'youtube', label: 'یوتیوب' },
                { value: 'whatsapp', label: 'واتس‌اپ' },
                { value: 'twitter', label: 'توییتر (X)' },
                { value: 'linkedin', label: 'لینکدین' },
                { value: 'other', label: 'سایر' },
              ]}
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              نام نمایشی *
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="مثال: اینستاگرام آکادمی"
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              آدرس لینک *
            </label>
            <Input
              id="url"
              name="url"
              type="url"
              value={formData.url}
              onChange={handleChange}
              required
              placeholder="https://instagram.com/..."
            />
          </div>

          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
              آیکون (ایموجی یا کلاس CSS)
            </label>
            <Input
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="مثال: 📸 یا fab fa-instagram"
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
