import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { fetchJson, putJson, deleteResource } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

interface SuccessStory {
  id: string;
  playerName: string;
  age: number;
  achievement: string;
  description: string;
  quote: string | null;
  image: string | null;
  date: string;
  goals: number;
  assists: number;
  matches: number;
  isPublished: boolean;
  displayOrder: number;
  program: { id: string; name: string } | null;
  coach: { id: string; firstName: string; lastName: string } | null;
}
interface Program {
  id: string;
  name: string;
}
interface Coach {
  id: string;
  firstName: string;
  lastName: string;
}

interface FormData {
  playerName: string;
  age: number;
  achievement: string;
  description: string;
  quote: string;
  image: string;
  date: string;
  goals: number;
  assists: number;
  matches: number;
  isPublished: boolean;
  programId: string;
  coachId: string;
  displayOrder: number;
}

export default function SuccessStoryEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [formData, setFormData] = useState<FormData>({
    playerName: '',
    age: 0,
    achievement: '',
    description: '',
    quote: '',
    image: '',
    date: '',
    goals: 0,
    assists: 0,
    matches: 0,
    isPublished: true,
    programId: '',
    coachId: '',
    displayOrder: 0,
  });

  const fetchData = React.useCallback(async () => {
    try {
      const [story, p, c] = await Promise.all([
        fetchJson<SuccessStory>(`/api/admin/content/success-stories/${id}`),
        fetchJson<Program[]>('/api/admin/programs'),
        fetchJson<Coach[]>('/api/admin/coaches'),
      ]);
      if (story) {
        setFormData({
          playerName: story.playerName,
          age: story.age,
          achievement: story.achievement,
          description: story.description,
          quote: story.quote ?? '',
          image: story.image ?? '',
          date: story.date.slice(0, 10),
          goals: story.goals,
          assists: story.assists,
          matches: story.matches,
          isPublished: story.isPublished,
          programId: story.program?.id ?? '',
          coachId: story.coach?.id ?? '',
          displayOrder: story.displayOrder,
        });
      }
      setPrograms(p);
      setCoaches(c);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: ['age', 'goals', 'assists', 'matches', 'displayOrder'].includes(name)
          ? parseInt(value, 10) || 0
          : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await putJson(`/api/admin/content/success-stories/${id}`, formData);
      router.push('/admin/content/success-stories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در به‌روزرسانی');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('آیا از حذف این داستان موفقیت مطمئن هستید؟')) return;
    setDeleting(true);
    try {
      await deleteResource(`/api/admin/content/success-stories/${id}`);
      router.push('/admin/content/success-stories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="ویرایش داستان موفقیت">
        <div className="bg-white rounded-2xl shadow-lg p-8" role="status" aria-label="در حال بارگذاری">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="ویرایش داستان موفقیت">
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ویرایش داستان موفقیت</h1>
          <p className="text-gray-600 mt-1">ویرایش داستان پیشرفت بازیکن</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
                نام بازیکن *
              </label>
              <Input
                id="playerName"
                name="playerName"
                value={formData.playerName}
                onChange={handleChange}
                required
                placeholder="مثال: امیر رضایی"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                سن *
              </label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                required
                min={5}
                max={50}
                placeholder="19"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="achievement" className="block text-sm font-medium text-gray-700 mb-2">
                دستاورد *
              </label>
              <Input
                id="achievement"
                name="achievement"
                value={formData.achievement}
                onChange={handleChange}
                required
                placeholder="مثال: انتقال به باشگاه پرسپولیس"
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
                placeholder="توضیحات کامل داستان موفقیت..."
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-2">
                نقل قول بازیکن
              </label>
              <Textarea
                id="quote"
                name="quote"
                value={formData.quote}
                onChange={handleChange}
                rows={3}
                placeholder="نقل قول مستقیم از بازیکن (اختیاری)"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                تاریخ *
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
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

            <div>
              <label htmlFor="goals" className="block text-sm font-medium text-gray-700 mb-2">
                تعداد گل
              </label>
              <Input
                id="goals"
                name="goals"
                type="number"
                value={formData.goals}
                onChange={handleChange}
                min={0}
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="assists" className="block text-sm font-medium text-gray-700 mb-2">
                تعداد Asistencia
              </label>
              <Input
                id="assists"
                name="assists"
                type="number"
                value={formData.assists}
                onChange={handleChange}
                min={0}
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="matches" className="block text-sm font-medium text-gray-700 mb-2">
                تعداد بازی
              </label>
              <Input
                id="matches"
                name="matches"
                type="number"
                value={formData.matches}
                onChange={handleChange}
                min={0}
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="programId" className="block text-sm font-medium text-gray-700 mb-2">
                برنامه
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
              <label htmlFor="coachId" className="block text-sm font-medium text-gray-700 mb-2">
                مربی
              </label>
              <Select
                id="coachId"
                name="coachId"
                value={formData.coachId}
                onChange={handleChange}
                options={[
                  { value: '', label: 'بدون مربی' },
                  ...coaches.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` })),
                ]}
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
