import { formatCurrency, formatDate, formatToman } from '@/lib/format';

export default function PaymentsSection({
  totalDue,
  busyAction,
  registrations,
  onPay,
}: {
  totalDue: number;
  busyAction: string | null;
  registrations: Array<{
    id: string;
    program: { name: string };
    payments: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      createdAt: string;
    }>;
  }>;
  onPay: () => void;
}) {
  const paymentStatus: Record<string, string> = {
    PAID: 'پرداخت‌شده',
    PENDING: 'در انتظار پرداخت',
    FAILED: 'ناموفق',
    REFUNDED: 'بازپرداخت‌شده',
    REFUND_REQUIRED: 'در انتظار پیگیری بازپرداخت',
  };
  const payments = registrations.flatMap((registration) =>
    registration.payments.map((payment) => ({
      ...payment,
      programName: registration.program.name,
    })),
  );

  return (
    <section
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      aria-labelledby="student-payments-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="student-payments-heading"
            className="text-lg font-semibold text-gray-900"
          >
            پرداخت شهریه
          </h2>
          <p className="mt-1 tabular-nums text-gray-600">
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
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="font-semibold text-gray-900">سوابق پرداخت</h3>
        {payments.length ? (
          <ul className="mt-2 divide-y divide-gray-100">
            {payments.map((payment) => {
              const status = paymentStatus[payment.status] ?? payment.status;
              const receipt = [
                'جزئیات پرداخت آکادمی فوتبال افشین پیروانی',
                `شناسه پرداخت: ${payment.id}`,
                `برنامه: ${payment.programName}`,
                `مبلغ: ${formatCurrency(payment.amount, payment.currency)}`,
                `وضعیت: ${status}`,
                `تاریخ: ${formatDate(payment.createdAt, 'fa-IR', { dateStyle: 'short', timeStyle: 'short' })}`,
              ].join('\n');

              return (
                <li key={payment.id} className="dashboard-list-item py-3">
                  <details>
                    <summary className="cursor-pointer rounded-md font-medium text-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
                      {payment.programName} · {status}
                    </summary>
                    <dl className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                      <div>
                        <dt className="inline">مبلغ: </dt>
                        <dd className="inline tabular-nums">
                          {formatCurrency(payment.amount, payment.currency)}
                        </dd>
                      </div>
                      <div>
                        <dt className="inline">شناسه: </dt>
                        <dd className="inline break-all" dir="ltr">
                          {payment.id}
                        </dd>
                      </div>
                      <div>
                        <dt className="inline">تاریخ: </dt>
                        <dd className="inline">
                          {formatDate(payment.createdAt)}
                        </dd>
                      </div>
                    </dl>
                    {payment.status === 'PAID' && (
                      <a
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(receipt)}`}
                        download={`payment-${payment.id}.txt`}
                        className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-primary-700 px-3 text-sm font-semibold text-primary-700 underline-offset-4 hover:underline"
                      >
                        دریافت جزئیات پرداخت
                      </a>
                    )}
                  </details>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-gray-600">
            هنوز پرداختی برای ثبت‌نام‌های شما ثبت نشده است.
          </p>
        )}
      </div>
    </section>
  );
}
