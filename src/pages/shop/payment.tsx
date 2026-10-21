import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import { saveShopCart } from '@/lib/shop-cart';

const messages: Record<string, { title: string; text: string; success: boolean }> = {
  success: { title: 'پرداخت با موفقیت انجام شد', text: 'سفارش شما ثبت شده و برای آماده‌سازی به فروشگاه ارسال شد.', success: true },
  cancelled: { title: 'پرداخت لغو شد', text: 'هزینه‌ای دریافت نشد. می‌توانید دوباره سفارش خود را ثبت کنید.', success: false },
  failed: { title: 'پرداخت ناموفق بود', text: 'پرداخت تأیید نشد و موجودی رزروشده آزاد شد.', success: false },
  'refund-required': { title: 'نیاز به پیگیری سفارش', text: 'پرداخت تأیید شد، اما زمان اعتبار سفارش گذشته است. لطفاً با آکادمی تماس بگیرید.', success: false },
  'verification-error': { title: 'تأیید پرداخت در انتظار بررسی است', text: 'وضعیت پرداخت از درگاه دریافت نشد. پیش از پرداخت مجدد با پشتیبانی تماس بگیرید.', success: false },
};

export default function ShopPaymentPage() {
  const router = useRouter();
  const result = typeof router.query.result === 'string' ? router.query.result : '';
  const order = typeof router.query.order === 'string' ? router.query.order : '';
  const message = messages[result];

  useEffect(() => {
    if (result === 'success') {
      try {
        saveShopCart([]);
      } catch (error) {
        console.error('Could not clear cart after successful payment:', error);
      }
    }
  }, [result]);

  return (
    <Layout title="وضعیت پرداخت فروشگاه">
      <section className="container-custom max-w-2xl py-16">
        {message ? (
          <div className={`rounded-2xl p-8 text-center ${message.success ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`}>
            <h1 className="text-2xl font-extrabold">{message.title}</h1>
            <p className="mt-3">{message.text}</p>
            {order && <p className="mt-4 font-semibold">شماره سفارش: {order}</p>}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/shop" className="btn btn-primary px-5 py-3">بازگشت به فروشگاه</Link>
              {!message.success && <Link href="/shop/cart" className="btn btn-outline px-5 py-3">مشاهده سبد خرید</Link>}
            </div>
          </div>
        ) : (
          <div role="status" className="text-center text-slate-600">در حال بررسی نتیجه پرداخت...</div>
        )}
      </section>
    </Layout>
  );
}
