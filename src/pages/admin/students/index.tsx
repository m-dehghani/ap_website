import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { fetchJson } from '@/lib/api-client';
import { formatToman } from '@/lib/format';
import type { PaginationMeta } from '@/types/api/response';
import type {
  AdminPaginatedResponse,
  AdminRegistrationViewModel,
} from '@/types/viewModels/admin';

const StudentsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<
    AdminRegistrationViewModel[]
  >([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statusOptions = [
    { value: '', label: 'همه' },
    { value: 'PENDING', label: 'در انتظار' },
    { value: 'APPROVED', label: 'تایید شده' },
    { value: 'CANCELLED', label: 'لغو شده' },
    { value: 'COMPLETED', label: 'تکمیل شده' },
  ];

  const fetchRegistrations = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: '20',
        });
        if (statusFilter) params.append('status', statusFilter);

        const data = await fetchJson<
          AdminPaginatedResponse<AdminRegistrationViewModel>
        >(`/api/admin/students?${params}`);
        setRegistrations(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('خطا در بارگذاری ثبت‌نام‌ها'),
        );
      } finally {
        setLoading(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRegistrations(1);
  }, [fetchRegistrations]);

  const handleStatusChange = async (
    registration: AdminRegistrationViewModel,
    newStatus: string,
  ) => {
    setUpdatingId(registration.id);
    try {
      const res = await fetch(`/api/admin/students/${registration.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...registration, status: newStatus }),
      });
      if (!res.ok) throw new Error('خطا در به‌روزرسانی');
      setRegistrations(
        registrations.map((r) =>
          r.id === registration.id ? { ...r, status: newStatus } : r,
        ),
      );
    } catch {
      alert('خطا در به‌روزرسانی وضعیت');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout title="مدیریت دانش‌آموزان">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            دانش‌آموزان و ثبت‌نام‌ها
          </h1>
          <p className="text-gray-600 mt-1">
            مدیریت و مشاهده تمام ثبت‌نام‌های آکادمی
          </p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
          role="alert"
        >
          خطا در بارگذاری ثبت‌نام‌ها: {error.message}
          <button
            type="button"
            onClick={() => void fetchRegistrations(pagination.page)}
            className="ml-4 underline"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-600 border-t-transparent"></div>
          </div>
        </div>
      )}

      {!loading && !error && registrations.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            هیچ ثبت‌نامی یافت نشد
          </h3>
          <p className="text-gray-500">با فیلترهای انتخابی مطابقت پیدا نشد</p>
        </div>
      )}

      {!loading && !error && registrations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    دانش‌آموز
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    برنامه
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    مربی
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    مبلغ
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    پرداخت شده
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    سطح
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    تاریخ ثبت‌نام
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {reg.user.firstName} {reg.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reg.user.email}
                        </div>
                        {reg.user.phone && (
                          <div className="text-sm text-gray-500">
                            {reg.user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {reg.program.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {reg.program.coach
                        ? `${reg.program.coach.firstName} ${reg.program.coach.lastName}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {formatToman(reg.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatToman(reg.paidAmount)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {reg.experienceLevel === 'BEGINNER' && 'مبتدی'}
                      {reg.experienceLevel === 'INTERMEDIATE' && 'متوسط'}
                      {reg.experienceLevel === 'ADVANCED' && 'پیشرفته'}
                      {!reg.experienceLevel && '—'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={reg.status}
                        onChange={(e) =>
                          handleStatusChange(reg, e.target.value)
                        }
                        disabled={updatingId === reg.id}
                        className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="PENDING">در انتظار</option>
                        <option value="APPROVED">تایید شده</option>
                        <option value="CANCELLED">لغو شده</option>
                        <option value="COMPLETED">تکمیل شده</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {format(new Date(reg.registeredAt), 'yyyy/MM/dd HH:mm', {
                        locale: faIR,
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/students/${reg.id}`}
                        className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="مشاهده جزئیات"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                صفحه {pagination.page} از {pagination.totalPages} - کل{' '}
                {pagination.total} ثبت‌نام
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => fetchRegistrations(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  قبلی
                </button>
                <button
                  onClick={() => fetchRegistrations(pagination.page + 1)}
                  disabled={
                    pagination.page === pagination.totalPages || loading
                  }
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  بعدی
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default StudentsPage;
