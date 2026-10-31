import { formatToman } from '@/lib/format';

export default function PaymentsSection({
  totalDue,
  busyAction,
  onPay,
}: {
  totalDue: number;
  busyAction: string | null;
  onPay: () => void;
}) {
  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">پرداخت شهریه</h2>
          <p className="mt-1 text-gray-600">
            مانده شهریه برنامه‌های فعال: {formatToman(totalDue)}
          </p>
        </div>
        <button
          type="button"
          disabled={totalDue <= 0 || busyAction === 'payment'}
          onClick={onPay}
          className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busyAction === 'payment'
            ? 'در حال انتقال...'
            : 'پرداخت از طریق زرین‌پال'}
        </button>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        پرداخت برای تمام مانده برنامه‌های فعال به‌صورت یکجا انجام می‌شود.
      </p>
    </section>
  );
}
