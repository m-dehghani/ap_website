import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { postJson } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

interface FormData {
  section: string;
  title: string;
  content: string;
  isActive: boolean;
  displayOrder: number;
}

export default function AboutContentNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    section: 'story',
    title: '',
    content: '{}',
    isActive: true,
    displayOrder: 0,
  });

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
      await postJson('/api/admin/content/about-content', {
        ...formData,
        content: contentObj,
      });
      router.push('/admin/content/about-content');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ایجاد بخش');
    } finally {
      setSaving(false);
    }
  };

  const sectionOptions = [
    { value: 'story', label: 'داستان ما' },
    { value: 'mission', label: 'ماموریت' },
    { value: 'vision', label: 'چشم‌انداز' },
    { value: 'values', label: 'ارزش‌ها' },
    { value: 'team', label: 'تیم مدیریت' },
    { value: 'facilities', label: 'امکانات' },
    { value: 'cta', label: 'دعوت به اقدام (CTA)' },
  ];

  return (
    <AdminLayout title="افزودن بخش درباره ما">
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">افزودن بخش جدید</h1>
          <p className="text-gray-600 mt-1">افزودن بخش جدید برای صفحه درباره ما</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
                بخش *
              </label>
              <Select
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                required
                options={sectionOptions}
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
                rows={8}
                placeholder={JSON.stringify({
                  story: 'story' === 'story' ? [
                    'پاراگراف اول داستان ما...',
                    'پاراگراف دوم داستان ما...',
                  ] : undefined,
                  mission: 'mission' === 'mission' ? {
                    title: 'ماموریت ما',
                    description: 'آموزش حرفه‌ای فوتبال...',
                  } : undefined,
                  vision: 'vision' === 'vision' ? {
                    title: 'چشم‌انداز ما',
                    description: 'تبدیل شدن به برترین آکادمی...',
                  } : undefined,
                  values: 'values' === 'values' ? {
                    title: 'ارزش‌های ما',
                    items: ['کیفیت در آموزش', 'احترام و صداقت'],
                  } : undefined,
                  team: 'team' === 'team' ? [
                    { name: 'علی احمدی', role: 'مدیر عامل', bio: 'توضیحات...', initials: 'AA' },
                  ] : undefined,
                  facilities: 'facilities' === 'facilities' ? {
                    pitches: ['زمین چمن طبیعی', 'زمین چمن مصنوعی'],
                    equipment: ['تجهیزات مدرن', 'سالن ورزشی'],
                  } : undefined,
                  cta: 'cta' === 'cta' ? {
                    title: 'آماده پیوستن؟',
                    description: 'همین امروز ثبت نام کنید...',
                  } : undefined,
                }, null, 2)}
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
            <Button type="button" variant="outline" onClick={() => router.back()}>
              انصراف
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'در حال ذخیره...' : 'ایجاد بخش'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
