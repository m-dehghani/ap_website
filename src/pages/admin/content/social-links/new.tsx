import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { postJson } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface FormData {
  platform: string;
  name: string;
  url: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
}

export default function SocialLinkNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    platform: 'instagram',
    name: '',
    url: '',
    icon: '',
    isActive: true,
    displayOrder: 0,
  });

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
      await postJson('/api/admin/content/social-links', formData);
      router.push('/admin/content/social-links');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ایجاد شبکه اجتماعی');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="افزودن شبکه اجتماعی">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">افزودن شبکه اجتماعی جدید</h1>
          <p className="text-gray-600 mt-1">تعریف لینک شبکه اجتماعی برای نمایش در فوتر و هدر</p>
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
            <Button type="button" variant="outline" onClick={() => router.back()}>
              انصراف
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'در حال ذخیره...' : 'ایجاد شبکه اجتماعی'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}