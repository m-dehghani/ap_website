import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { fetchJson, putJson } from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface AcademyInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  privacyEmail: string | null;
  address: string;
  city: string;
  foundedYear: number | null;
  domain: string;
}

export default function AcademyInfoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<AcademyInfo>({
    id: 'default',
    name: '',
    tagline: '',
    description: '',
    phone: '',
    email: '',
    privacyEmail: '',
    address: '',
    city: '',
    foundedYear: null,
    domain: '',
  });

  React.useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const data = await fetchJson<AcademyInfo>('/api/admin/content/academy-info');
        if (isMounted && data) {
          setFormData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'خطا در بارگذاری اطلاعات');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'foundedYear' ? (value ? parseInt(value, 10) : null) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await putJson('/api/admin/content/academy-info', formData);
      toast.success('اطلاعات آکادمی با موفقیت ذخیره شد');
      await router.push('/admin/content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره اطلاعات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="اطلاعات آکادمی">
        <div className="bg-white rounded-2xl shadow-lg p-8" role="status" aria-label="در حال بارگذاری">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="اطلاعات آکادمی">
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">اطلاعات آکادمی</h1>
          <p className="text-gray-600 mt-1">ویرایش اطلاعات اصلی آکادمی که در کل سایت نمایش داده می‌شود</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                نام آکادمی *
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="مثال: آکادمی فوتبال AP"
              />
            </div>

            <div>
              <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-2">
                شعار *
              </label>
              <Input
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                required
                placeholder="مثال: جایی که قهرمانان ساخته می‌شوند"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                توضیحات آکادمی *
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="توضیحات کامل آکادمی برای نمایش در صفحه درباره ما..."
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                تلفن *
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="مثال: 021-12345678"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                ایمیل *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="مثال: info@example.com"
              />
            </div>

            <div>
              <label htmlFor="privacyEmail" className="block text-sm font-medium text-gray-700 mb-2">
                ایمیل حریم خصوصی
              </label>
              <Input
                id="privacyEmail"
                name="privacyEmail"
                type="email"
                value={formData.privacyEmail ?? ''}
                onChange={handleChange}
                placeholder="مثال: privacy@example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                آدرس *
              </label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="آدرس کامل آکادمی"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                شهر *
              </label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="مثال: تهران"
              />
            </div>

            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                دامنه وب‌سایت *
              </label>
              <Input
                id="domain"
                name="domain"
                type="url"
                value={formData.domain}
                onChange={handleChange}
                required
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700 mb-2">
                سال تاسیس (شمسی)
              </label>
              <Input
                id="foundedYear"
                name="foundedYear"
                type="number"
                value={formData.foundedYear ?? ''}
                onChange={handleChange}
                min={1300}
                max={1500}
                placeholder="مثال: 1393"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 space-x-reverse pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/content')}>
              بازگشت
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