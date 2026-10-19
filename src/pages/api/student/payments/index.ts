import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'node:crypto';
import { authorizeStudent } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { getZarinpalConfig, requestPayment } from '@/lib/zarinpal';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userId = await authorizeStudent(req, res);
    if (!userId) return;
    const config = getZarinpalConfig();
    if (!config) {
      return res.status(503).json({
        message: 'درگاه پرداخت پیکربندی نشده است؛ لطفاً با آکادمی تماس بگیرید',
      });
    }

    const db = await getPrisma();
    const checkoutReference = `pending:${randomUUID()}`;
    const result = await db.$transaction(
      async (tx) => {
        const pendingPayment = await tx.payment.findFirst({
          where: {
            userId,
            method: 'ZARINPAL',
            status: 'PENDING',
          },
          select: { id: true },
        });
        if (pendingPayment) return { kind: 'pending' as const };

        const registrations = await tx.registration.findMany({
          where: {
            userId,
            status: { not: 'CANCELLED' },
          },
          select: {
            id: true,
            totalAmount: true,
            paidAmount: true,
            program: { select: { name: true } },
          },
        });
        const balances = registrations
          .map((registration) => ({
            ...registration,
            due: Math.max(registration.totalAmount - registration.paidAmount, 0),
          }))
          .filter((registration) => registration.due > 0);
        const totalDue = balances.reduce(
          (total, registration) => total + registration.due,
          0,
        );
        const amountInRial = totalDue * 10;
        if (
          totalDue <= 0 ||
          !Number.isSafeInteger(totalDue) ||
          !Number.isSafeInteger(amountInRial) ||
          amountInRial > 2_147_483_647
        ) {
          return { kind: 'no-balance' as const };
        }

        await Promise.all(
          balances.map((registration) =>
            tx.payment.create({
              data: {
                userId,
                registrationId: registration.id,
                amount: registration.due * 10,
                currency: 'IRR',
                method: 'ZARINPAL',
                status: 'PENDING',
                providerReference: checkoutReference,
              },
            }),
          ),
        );
        return {
          kind: 'created' as const,
          amountInRial,
          description: `پرداخت شهریه ${balances.map(({ program }) => program.name).join('، ')}`.slice(
            0,
            250,
          ),
        };
      },
      { isolationLevel: 'Serializable' },
    );

    if (result.kind === 'pending') {
      return res.status(409).json({
        message: 'یک پرداخت در حال انجام دارید؛ پس از بازگشت از درگاه دوباره تلاش کنید',
      });
    }
    if (result.kind === 'no-balance') {
      return res.status(400).json({ message: 'مبلغ پرداخت‌نشده‌ای برای برنامه‌های شما وجود ندارد' });
    }

    try {
      const { authority, paymentUrl } = await requestPayment(
        config,
        result.amountInRial,
        result.description,
        `${config.siteUrl}/api/student/payments/callback`,
      );
      await db.payment.updateMany({
        where: { providerReference: checkoutReference },
        data: { providerReference: authority },
      });
      return res.status(200).json({ paymentUrl });
    } catch (error) {
      await db.payment.updateMany({
        where: { providerReference: checkoutReference, status: 'PENDING' },
        data: { status: 'FAILED' },
      });
      console.error('Zarinpal payment request error:', error);
      return res.status(502).json({
        message: 'ایجاد درخواست پرداخت ناموفق بود؛ لطفاً دوباره تلاش کنید',
      });
    }
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2034'
    ) {
      return res.status(409).json({
        message: 'درخواست پرداخت دیگری هم‌زمان ایجاد شده است؛ لطفاً وضعیت را بررسی کنید',
      });
    }
    console.error('Student payment initialization error:', error);
    return res.status(500).json({ message: 'خطا در ایجاد درخواست پرداخت' });
  }
}
