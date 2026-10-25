import React from 'react';
import Link from 'next/link';
import { useFetch } from '@/hooks/useFetch';
import { useDelete } from '@/hooks/useDelete';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import type { TableColumn } from '@/components/ui/Table';

type AccentColor =
  | 'primary'
  | 'emerald'
  | 'secondary'
  | 'amber'
  | 'purple'
  | 'red'
  | 'teal'
  | 'orange'
  | 'cyan'
  | 'rose';

function getAccentClasses(accent: AccentColor, variant: 'bg' | 'hover' = 'bg'): string {
  const colors: Record<AccentColor, { bg: string; hover: string }> = {
    primary: { bg: 'bg-primary-600 hover:bg-primary-700', hover: 'hover:text-primary-600 hover:bg-primary-50' },
    emerald: { bg: 'bg-emerald-600 hover:bg-emerald-700', hover: 'hover:text-emerald-600 hover:bg-emerald-50' },
    secondary: { bg: 'bg-secondary-600 hover:bg-secondary-700', hover: 'hover:text-secondary-600 hover:bg-secondary-50' },
    amber: { bg: 'bg-amber-600 hover:bg-amber-700', hover: 'hover:text-amber-600 hover:bg-amber-50' },
    purple: { bg: 'bg-purple-600 hover:bg-purple-700', hover: 'hover:text-purple-600 hover:bg-purple-50' },
    red: { bg: 'bg-red-600 hover:bg-red-700', hover: 'hover:text-red-600 hover:bg-red-50' },
    teal: { bg: 'bg-teal-600 hover:bg-teal-700', hover: 'hover:text-teal-600 hover:bg-teal-50' },
    orange: { bg: 'bg-orange-600 hover:bg-orange-700', hover: 'hover:text-orange-600 hover:bg-orange-50' },
    cyan: { bg: 'bg-cyan-600 hover:bg-cyan-700', hover: 'hover:text-cyan-600 hover:bg-cyan-50' },
    rose: { bg: 'bg-rose-600 hover:bg-rose-700', hover: 'hover:text-rose-600 hover:bg-rose-50' },
  };
  return colors[accent]?.[variant] ?? colors.primary[variant];
}

interface AdminListPageProps<T extends { id: string }> {
  title: string;
  description: string;
  addHref: string;
  addLabel: string;
  columns: TableColumn<T>[];
  fetchFn: () => Promise<T[]>;
  deleteFn: (id: string) => Promise<void>;
  editHref: (item: T) => string;
  accent?: AccentColor;
  confirmDeleteMessage?: string;
  emptyMessage?: string;
}

function AddItemLink({
  href,
  accent,
  children,
}: {
  href: string;
  accent: AccentColor;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors ${getAccentClasses(accent, 'bg')}`}
    >
      <svg
        className="w-5 h-5 ml-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      {children}
    </Link>
  );
}

export function AdminListPage<T extends { id: string }>({
  title,
  description,
  addHref,
  addLabel,
  columns,
  fetchFn,
  deleteFn,
  editHref,
  accent = 'primary',
  confirmDeleteMessage,
  emptyMessage = 'هیچ موردی یافت نشد',
}: AdminListPageProps<T>) {
  const { data, loading, error, refetch } = useFetch(fetchFn);
  const deleteActions = useDelete(deleteFn);
  const accentClasses = getAccentClasses(accent, 'hover');

  const handleDelete = async (id: string) => {
    if (await deleteActions.handleDelete(id, confirmDeleteMessage)) {
      await refetch();
    }
  };

  if (loading) {
    return (
      <div
        className="bg-white rounded-2xl shadow-lg p-8"
        role="status"
        aria-label="در حال بارگذاری"
      >
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
        role="alert"
      >
        خطا در بارگذاری داده‌ها: {error.message}
        <Button
          onClick={() => void refetch()}
          className="ml-4"
          variant="outline"
          size="sm"
        >
          تلاش مجدد
        </Button>
      </div>
    );
  }

  const tableColumns: TableColumn<T>[] = [
    ...columns,
    {
      key: 'actions',
      header: 'عملیات',
      render: (item) => (
        <div className="flex items-center space-x-2 space-x-reverse">
          <Link
            href={editHref(item)}
            className={`p-2 text-gray-500 ${accentClasses} rounded-lg transition-colors`}
            title="مشاهده/ویرایش"
            aria-label="مشاهده/ویرایش"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
            type="button"
            onClick={() => void handleDelete(item.id)}
            disabled={deleteActions.isDeleting(item.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="حذف"
            aria-label="حذف"
          >
            {deleteActions.isDeleting(item.id) ? (
              <svg
                className="animate-spin w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
                aria-hidden="true"
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
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        <AddItemLink href={addHref} accent={accent}>
          {addLabel}
        </AddItemLink>
      </div>

      {deleteActions.error && (
        <p className="text-red-700" role="alert">
          خطا در حذف مورد: {deleteActions.error.message}
        </p>
      )}

      {data?.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
          <div className="mt-4">
            <AddItemLink href={addHref} accent={accent}>
              ایجاد اولین مورد
            </AddItemLink>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <Table
            columns={tableColumns}
            data={data ?? []}
            keyExtractor={(item) => item.id}
            emptyMessage={emptyMessage}
          />
        </div>
      )}
    </div>
  );
}