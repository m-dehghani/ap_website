import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { formatPersianDate, formatToman } from '@/lib/format';
import type { AdminRegistrationViewModel } from '@/types/viewModels/admin';

const StudentDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [registration, setRegistration] =
    useState<AdminRegistrationViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700',
      APPROVED: 'bg-emerald-100 text-emerald-700',
      CANCELLED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-emerald-100 text-emerald-700',
    };
    const labels: Record<string, string> = {
      PENDING: 'در انتظار',
      APPROVED: 'تایید شده',
      CANCELLED: 'لغو شده',
      COMPLETED: 'تکمیل شده',
    };
    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badges[status] || 'bg-gray-100 text-gray-700'}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  useEffect(() => {
    if (id) {
      const fetchRegistration = async () => {
        if (!id) return;
        setLoading(true);
        try {
          const res = await fetch(`/api/admin/students/${id}`);
          if (!res.ok) {
            if (res.status === 404) {
              router.push('/admin/students');
            }
            throw new Error('ثبت‌نام یافت نشد');
          }
          const data = await res.json();
          setRegistration(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'خطا در بارگذاری');
        } finally {
          setLoading(false);
        }
      };

      fetchRegistration();
    }
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setRegistration((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registration),
      });

      if (!res.ok) throw new Error('خطا در ذخیره');
      router.push('/admin/students');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="جزئیات ثبت‌نام">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!registration) {
    return (
      <AdminLayout title="جزئیات ثبت‌نام">
        <div className="text-center py-12">
          <p className="text-gray-500">ثبت‌نام یافت نشد</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="جزئیات ثبت‌نام">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">جزئیات ثبت‌نام</h1>
            <p className="text-gray-600 mt-1">
              مشاهده و ویرایش اطلاعات ثبت‌نام
            </p>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            {getStatusBadge(registration.status)}
          </div>
        </div>

        {error && (
          <div
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Student Info */}
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              اطلاعات دانش‌آموز
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام
                </label>
                <input
                  type="text"
                  value={`${registration.user.firstName} ${registration.user.lastName}`}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ایمیل
                </label>
                <input
                  type="email"
                  value={registration.user.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تلفن
                </label>
                <input
                  type="tel"
                  value={registration.user.phone || '—'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاریخ تولد
                </label>
                <input
                  type="text"
                  value={
                    formatPersianDate(registration.user.birthDate) || '—'
                  }
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </section>

          {/* Program Info */}
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              اطلاعات برنامه
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  برنامه
                </label>
                <input
                  type="text"
                  value={registration.program.name}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مربی
                </label>
                <input
                  type="text"
                  value={
                    registration.program.coach
                      ? `${registration.program.coach.firstName} ${registration.program.coach.lastName}`
                      : '—'
                  }
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  قیمت برنامه
                </label>
                <input
                  type="text"
                  value={formatToman(registration.program.price)}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سطح تجربه
                </label>
                <select
                  name="experienceLevel"
                  value={registration.experienceLevel || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">انتخاب کنید</option>
                  <option value="BEGINNER">مبتدی</option>
                  <option value="INTERMEDIATE">متوسط</option>
                  <option value="ADVANCED">پیشرفته</option>
                </select>
              </div>
            </div>
          </section>

          {/* Financial Info */}
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              اطلاعات مالی
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مبلغ کل
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  value={registration.totalAmount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مبلغ پرداخت شده
                </label>
                <input
                  type="number"
                  name="paidAmount"
                  value={registration.paidAmount}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مبلغ باقی‌مانده
                </label>
                <input
                  type="text"
                  value={formatToman(
                    registration.totalAmount - registration.paidAmount,
                  )}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-medium text-amber-600"
                />
              </div>
            </div>

            {/* Payments */}
            {registration.payments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  پرداخت‌ها
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="text-right pb-2">مبلغ</th>
                        <th className="text-right pb-2">وضعیت</th>
                        <th className="text-right pb-2">تاریخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registration.payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-t border-gray-200"
                        >
                          <td className="py-2 text-right">
                            {formatToman(
                              payment.currency === 'IRR'
                                ? payment.amount / 10
                                : payment.amount,
                            )}
                          </td>
                          <td className="py-2 text-right">
                            <span
                              className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                                payment.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : payment.status === 'PENDING'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-2 text-right">
                            {format(
                              new Date(payment.createdAt),
                              'yyyy/MM/dd HH:mm',
                              { locale: faIR },
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* Parent Info */}
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              اطلاعات ولي
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام ولي
                </label>
                <input
                  type="text"
                  name="parentName"
                  value={registration.parentName || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ایمیل ولي
                </label>
                <input
                  type="email"
                  name="parentEmail"
                  value={registration.parentEmail || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام تماس اضطراری
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={registration.emergencyContactName || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تلفن تماس اضطراری
                </label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={registration.emergencyContactPhone || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </section>

          {/* Medical Conditions */}
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              شرایط پزشکی
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شرایط پزشکی / حساسیت‌ها
              </label>
              <textarea
                name="medicalConditions"
                value={registration.medicalConditions || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="هرگونه حساسیت، بیماری یا شرایط پزشکی خاص..."
              />
            </div>
          </section>

          {/* Status */}
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              وضعیت ثبت‌نام
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وضعیت
              </label>
              <select
                name="status"
                value={registration.status}
                onChange={handleChange}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="PENDING">در انتظار</option>
                <option value="APPROVED">تایید شده</option>
                <option value="CANCELLED">لغو شده</option>
                <option value="COMPLETED">تکمیل شده</option>
              </select>
            </div>
          </section>

          {/* Timestamps */}
          <section className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              زمان‌ها
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاریخ ثبت‌نام
                </label>
                <input
                  type="text"
                  value={format(
                    new Date(registration.registeredAt),
                    'yyyy/MM/dd HH:mm',
                    { locale: faIR },
                  )}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  آخرین به‌روزرسانی
                </label>
                <input
                  type="text"
                  value={format(
                    new Date(registration.updatedAt),
                    'yyyy/MM/dd HH:mm',
                    { locale: faIR },
                  )}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end space-x-4 space-x-reverse">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              بازگشت
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default StudentDetailPage;
