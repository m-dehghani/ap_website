import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { fetchJson, postJson } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

interface Program {
  id: string;
  name: string;
}

interface FormData {
  name: string;
  role: string;
  content: string;
  image: string;
  rating: number;
  category: string;
  improvement: string;
  date: string;
  isPublished: boolean;
  programId: string;
  displayOrder: number;
}

export default function TestimonialNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: '',
    content: '',
    image: '',
    rating: 5,
    category: 'GENERAL',
    improvement: '',
    date: '',
    isPublished: true,
    programId: '',
    displayOrder: 0,
  });

  React.useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await fetchJson<Program[]>('/api/admin/programs');
      setPrograms(data);
    } catch {
      // ignore
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'rating' || name === 'displayOrder' ? parseInt(value, 10) || 0 : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await postJson('/api/admin/content/testimonials', formData);
      router.push('/admin/content/testimonials');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ایجاد نظر');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="افزودن نظر">
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">افزودن نظر جدید</h1>
          <p className="text-gray-600 mt-1">ثبت نظر یا توصیه دانش‌آموز/والدین</p>
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
                نام *
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="مثال: احمد کریمی"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                نقش *
              </label>
              <Input
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                placeholder="مثال: والد دانش‌آموز، بازیکن ۱۶ ساله"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                متن نظر *
              </label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={4}
                placeholder="متن کامل نظر..."
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                دسته‌بندی
              </label>
              <Select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={[
                  { value: 'GENERAL', label: 'عمومی' },
                  { value: 'SUCCESS', label: 'موفقیت' },
                ]}
              />
            </div>

            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
                امتیاز (۱ تا ۵)
              </label>
              <Select
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                options={[
                  { value: '5', label: '۵ - عالی' },
                  { value: '4', label: '۴ - خوب' },
                  { value: '3', label: '۳ - متوسط' },
                  { value: '2', label: '۲ - ضعیف' },
                  { value: '1', label: '۱ - بسیار ضعیف' },
                ]}
              />
            </div>

            <div>
              <label htmlFor="programId" className="block text-sm font-medium text-gray-700 mb-2">
                برنامه مرتبط
              </label>
              <Select
                id="programId"
                name="programId"
                value={formData.programId}
                onChange={handleChange}
                options={[
                  { value: '', label: 'بدون برنامه' },
                  ...programs.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            </div>

            <div>
              <label htmlFor="improvement" className="block text-sm font-medium text-gray-700 mb-2">
                پیشرفت/بهبود
              </label>
              <Input
                id="improvement"
                name="improvement"
                value={formData.improvement}
                onChange={handleChange}
                placeholder="مثال: +۴۰٪ مهارت فنی"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                تاریخ
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                آدرس تصویر
              </label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">منتشر شده</span>
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
              {saving ? 'در حال ذخیره...' : 'ایجاد نظر'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}