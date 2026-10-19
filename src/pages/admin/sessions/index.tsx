import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { fetchJson } from '@/lib/api-client';
import type { PaginationMeta } from '@/types/api/response';
import type {
  AdminPaginatedResponse,
  AdminSessionListItem,
} from '@/types/viewModels/admin';

const SessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<AdminSessionListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const statusOptions = [
    { value: '', label: 'همه' },
    { value: 'SCHEDULED', label: 'برنامه‌ریزی شده' },
    { value: 'ONGOING', label: 'در حال برگزاری' },
    { value: 'COMPLETED', label: 'تکمیل شده' },
    { value: 'CANCELLED', label: 'لغو شده' },
  ];

  const fetchSessions = useCallback(
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
          AdminPaginatedResponse<AdminSessionListItem>
        >(`/api/admin/sessions?${params}`);
        setSessions(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('خطا در بارگذاری جلسات'),
        );
      } finally {
        setLoading(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions(1);
  }, [fetchSessions]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      SCHEDULED: 'bg-blue-100 text-blue-700',
      ONGOING: 'bg-purple-100 text-purple-700',
      COMPLETED: 'bg-emerald-100 text-emerald-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      SCHEDULED: 'برنامه‌ریزی شده',
      ONGOING: 'در حال برگزاری',
      COMPLETED: 'تکمیل شده',
      CANCELLED: 'لغو شده',
    };
    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badges[status] || 'bg-gray-100 text-gray-700'}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این جلسه مطمئن هستید؟')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/sessions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSessions(sessions.filter((s) => s.id !== id));
      } else {
        alert('خطا در حذف جلسه');
      }
    } catch {
      alert('خطا در حذف جلسه');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout title="مدیریت جلسات">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">جلسات تمرینی</h1>
          <p className="text-gray-600 mt-1">
            مدیریت و مشاهده تمام جلسات آکادمی
          </p>
        </div>
        <Link
          href="/admin/sessions/new"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          افزودن جلسه جدید
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
          role="alert"
        >
          خطا در بارگذاری جلسات: {error.message}
          <button
            type="button"
            onClick={() => void fetchSessions(pagination.page)}
            className="ml-4 underline"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
          </div>
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            هیچ جلسه‌ای یافت نشد
          </h3>
          <p className="text-gray-500 mb-6">
            با فیلترهای انتخابی مطابقت پیدا نشد
          </p>
          <Link
            href="/admin/sessions/new"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            ایجاد اولین جلسه
          </Link>
        </div>
      )}

      {!loading && !error && sessions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    جلسه
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    برنامه
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    مربی
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    تاریخ و ساعت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    مکان
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    مدت (دقیقه)
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ظرفیت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    حضور/غیاب
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    وضعیت
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {session.name}
                      </div>
                      {session.description && (
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {session.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {session.program?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {session.coach
                        ? `${session.coach.firstName} ${session.coach.lastName}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {format(new Date(session.date), 'yyyy/MM/dd HH:mm', {
                        locale: faIR,
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {session.location}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {session.duration}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {session.maxCapacity}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {session.attendance.map((a) => (
                          <span
                            key={a.id}
                            className={`w-2 h-2 rounded-full ${
                              a.status === 'PRESENT'
                                ? 'bg-emerald-500'
                                : a.status === 'LATE'
                                  ? 'bg-amber-500'
                                  : a.status === 'EXCUSED'
                                    ? 'bg-blue-500'
                                    : 'bg-red-500'
                            }`}
                            title={`${a.user.firstName} ${a.user.lastName}: ${a.status}`}
                          />
                        ))}
                        <span className="text-xs text-gray-500">
                          {session.attendance.length}/{session.maxCapacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Link
                          href={`/admin/sessions/${session.id}`}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="مشاهده/ویرایش"
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
                        <button
                          onClick={() => handleDelete(session.id)}
                          disabled={deletingId === session.id}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="حذف"
                        >
                          {deletingId === session.id ? (
                            <svg
                              className="animate-spin w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          ) : (
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
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
                {pagination.total} جلسه
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => fetchSessions(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  قبلی
                </button>
                <button
                  onClick={() => fetchSessions(pagination.page + 1)}
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

export default SessionsPage;
