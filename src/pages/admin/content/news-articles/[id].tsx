import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { fetchJson, putJson, deleteResource } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  type: string;
  author: string;
  image: string | null;
  tags: string[];
  readTimeMinutes: number;
  likes: number;
  comments: number;
  featured: boolean;
  isPublished: boolean;
  publishedAt: string;
}
interface NewsCategory {
  id: string;
  slug: string;
  name: string;
}

interface FormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  type: string;
  author: string;
  image: string;
  tags: string;
  readTimeMinutes: number;
  likes: number;
  comments: number;
  featured: boolean;
  isPublished: boolean;
  publishedAt: string;
}

export default function NewsArticleEditPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    type: 'NEWS',
    author: '',
    image: '',
    tags: '',
    readTimeMinutes: 1,
    likes: 0,
    comments: 0,
    featured: false,
    isPublished: true,
    publishedAt: '',
  });

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      const [article, cats] = await Promise.all([
        fetchJson<NewsArticle>(`/api/admin/content/news-articles/${id}`),
        fetchJson<NewsCategory[]>('/api/admin/content/news-categories'),
      ]);
      if (article) {
        setFormData({
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          category: article.category,
          type: article.type,
          author: article.author,
          image: article.image ?? '',
          tags: article.tags.join(', '),
          readTimeMinutes: article.readTimeMinutes,
          likes: article.likes,
          comments: article.comments,
          featured: article.featured,
          isPublished: article.isPublished,
          publishedAt: article.publishedAt.slice(0, 16),
        });
      }
      setCategories(cats);
    } catch (err) {
      setError('خطا در بارگذاری داده‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: ['readTimeMinutes', 'likes', 'comments'].includes(name)
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
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        publishedAt: new Date(formData.publishedAt).toISOString(),
      };
      await putJson(`/api/admin/content/news-articles/${id}`, payload);
      router.push('/admin/content/news-articles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در به‌روزرسانی');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('آیا از حذف این مقاله/خبر مطمئن هستید؟')) return;
    setDeleting(true);
    try {
      await deleteResource(`/api/admin/content/news-articles/${id}`);
      router.push('/admin/content/news-articles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در حذف');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="ویرایش مقاله/خبر">
        <div className="bg-white rounded-2xl shadow-lg p-8" role="status" aria-label="در حال بارگذاری">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="ویرایش مقاله/خبر">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ویرایش مقاله/خبر</h1>
          <p className="text-gray-600 mt-1">ویرایش مقاله، ویدئو یا گالری</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                عنوان *
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="عنوان مقاله/خبر"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                چکیده *
              </label>
              <Textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                required
                rows={3}
                placeholder="خلاصه کوتاه برای نمایش در لیست‌ها..."
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                محتوای کامل *
              </label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={10}
                placeholder="متن کامل مقاله/خبر (پشتیبانی از HTML ساده)..."
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                دسته‌بندی *
              </label>
              <Select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                options={[
                  { value: '', label: 'انتخاب دسته‌بندی' },
                  ...categories.map((c) => ({ value: c.slug, label: c.name })),
                ]}
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                نوع *
              </label>
              <Select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                options={[
                  { value: 'NEWS', label: 'خبر' },
                  { value: 'VIDEO', label: 'ویدئو' },
                  { value: 'GALLERY', label: 'گالری' },
                ]}
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                نویسنده *
              </label>
              <Input
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                placeholder="مثال: مدیر آکادمی"
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                آدرس تصویر شاخص
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
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                برچسب‌ها (با کاما جدا کنید)
              </label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="مثال: قهرمانی، نوجوانان، مسابقات"
              />
            </div>

            <div>
              <label htmlFor="readTimeMinutes" className="block text-sm font-medium text-gray-700 mb-2">
                زمان خواندن (دقیقه)
              </label>
              <Input
                id="readTimeMinutes"
                name="readTimeMinutes"
                type="number"
                value={formData.readTimeMinutes}
                onChange={handleChange}
                min={1}
                placeholder="1"
              />
            </div>

            <div>
              <label htmlFor="likes" className="block text-sm font-medium text-gray-700 mb-2">
                تعداد لایک
              </label>
              <Input
                id="likes"
                name="likes"
                type="number"
                value={formData.likes}
                onChange={handleChange}
                min={0}
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                تعداد نظر
              </label>
              <Input
                id="comments"
                name="comments"
                type="number"
                value={formData.comments}
                onChange={handleChange}
                min={0}
                placeholder="0"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">مقاله ویژه</span>
              </label>
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
              <label htmlFor="publishedAt" className="block text-sm font-medium text-gray-700 mb-2">
                تاریخ و ساعت انتشار *
              </label>
              <Input
                id="publishedAt"
                name="publishedAt"
                type="datetime-local"
                value={formData.publishedAt}
                onChange={handleChange}
                required
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