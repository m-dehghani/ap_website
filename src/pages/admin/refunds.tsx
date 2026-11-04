import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatDate, formatToman } from '@/lib/format';

interface RefundQueueItem {
  id: string;
  type: 'payment' | 'shopOrder';
  customerName: string;
  phone: string | null;
  description: string;
  reference: string;
  amount: number;
  currency: string;
  method: string;
  createdAt: string;
}

interface RefundQueueResponse {
  data: RefundQueueItem[];
}

export default function RefundsPage() {
  const [items, setItems] = useState<RefundQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchQueue = useCallback(async () => {
    const response = await fetch('/api/admin/refunds');
    if (!response.ok) throw new Error('بارگذاری صف بازپرداخت ناموفق بود.');
    const result = (await response.json()) as RefundQueueResponse;
    return result.data;
  }, []);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await fetchQueue());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'بارگذاری صف بازپرداخت ناموفق بود.',
      );
    } finally {
      setLoading(false);
    }
  }, [fetchQueue]);

  useEffect(() => {
    let active = true;
    void fetchQueue()
      .then((result) => {
        if (active) setItems(result);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'بارگذاری صف بازپرداخت ناموفق بود.',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchQueue]);

  const markRefunded = async (item: RefundQueueItem) => {
    const key = `${item.type}:${item.id}`;
    setUpdatingKey(key);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/admin/refunds', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: item.type, id: item.id }),
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(
          result?.message ?? 'ثبت وضعیت بازپرداخت ناموفق بود؛ دوباره تلاش کنید.',
        );
      }
      setItems((current) =>
        current.filter(
          (queued) => queued.id !== item.id || queued.type !== item.type,
        ),
      );
      setSuccess('بازپرداخت خارج از سامانه انجام و ثبت شد.');
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'ثبت وضعیت بازپرداخت ناموفق بود؛ دوباره تلاش کنید.',
      );
    } finally {
      setUpdatingKey(null);
    }
  };

  return (
    <AdminLayout title="صف بازپرداخت">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">صف بازپرداخت</h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              بازپرداخت این موارد را در پنل بانکی یا درگاه انجام دهید و سپس وضعیت را اینجا ثبت کنید.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadQueue()}
            disabled={loading || updatingKey !== null}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            تازه‌سازی فهرست
          </button>
        </div>

        {success && (
          <p
            className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
            role="status"
            aria-live="polite"
          >
            {success}
          </p>
        )}

        {error && (
          <div
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
            role="alert"
          >
            <p>{error}</p>
            {!loading && (
              <button
                type="button"
                onClick={() => void loadQueue()}
                className="mt-2 font-semibold underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                بارگذاری دوباره
              </button>
            )}
          </div>
        )}

        {loading && (
          <div
            className="flex min-h-40 items-center justify-center rounded-xl border border-gray-200 bg-white"
            role="status"
          >
            <span className="text-gray-600">در حال بارگذاری صف بازپرداخت…</span>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-gray-600">
            موردی در صف بازپرداخت نیست.
          </p>
        )}

        {!loading && !error && items.length > 0 && (
          <div
            className="max-w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            role="region"
            aria-labelledby="refund-queue-caption"
            tabIndex={0}
          >
            <table className="w-full min-w-[900px] border-collapse text-right text-sm">
              <caption id="refund-queue-caption" className="sr-only">
                موارد نیازمند بازپرداخت
              </caption>
              <thead className="sticky top-0 z-10 bg-gray-50 text-gray-700">
                <tr>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                    نوع
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                    شناسه پیگیری
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                    درخواست‌کننده
                  </th>
                  <th scope="col" className="min-w-48 px-4 py-3 font-semibold">
                    جزئیات
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                    مبلغ
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                    زمان ثبت
                  </th>
                  <th scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => {
                  const key = `${item.type}:${item.id}`;
                  const amountInToman =
                    item.currency === 'IRR' ? item.amount / 10 : item.amount;
                  return (
                    <tr key={key} className="align-middle text-gray-800">
                      <td className="whitespace-nowrap px-4 py-4">
                        {item.type === 'payment' ? 'شهریه' : 'سفارش فروشگاه'}
                      </td>
                      <th scope="row" className="whitespace-nowrap px-4 py-4 font-medium">
                        <span dir="ltr">{item.reference}</span>
                      </th>
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="font-medium">{item.customerName}</div>
                        <div className="mt-1 text-xs text-gray-600">
                          {item.phone || 'شماره تماس ثبت نشده'}
                        </div>
                      </td>
                      <td className="px-4 py-4">{item.description || '—'}</td>
                      <td className="whitespace-nowrap px-4 py-4 font-semibold tabular-nums">
                        {formatToman(amountInToman)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        {formatDate(item.createdAt, 'fa-IR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                          timeZone: 'Asia/Tehran',
                        })}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <button
                          type="button"
                          onClick={() => void markRefunded(item)}
                          disabled={updatingKey !== null}
                          className="min-h-11 rounded-lg bg-primary-700 px-4 py-2 font-semibold text-white transition-colors hover:bg-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingKey === key
                            ? 'در حال ثبت…'
                            : 'ثبت انجام بازپرداخت'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
