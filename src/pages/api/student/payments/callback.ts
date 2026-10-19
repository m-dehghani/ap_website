import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { getZarinpalConfig, verifyPayment } from '@/lib/zarinpal';

function redirectToDashboard(res: NextApiResponse, result: string) {
  res.redirect(302, `/student/dashboard?payment=${encodeURIComponent(result)}`);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authorityValue = req.query.Authority ?? req.query.authority;
  const statusValue = req.query.Status ?? req.query.status;
  const authority =
    typeof authorityValue === 'string' &&
    /^[a-zA-Z0-9]{1,64}$/.test(authorityValue)
      ? authorityValue
      : null;
  if (!authority) {
    return res.status(400).json({ message: 'شناسه پرداخت معتبر نیست' });
  }

  try {
    const db = await getPrisma();
    const payments = await db.payment.findMany({
      where: { providerReference: authority, method: 'ZARINPAL' },
      select: { id: true, amount: true, status: true },
    });
    if (payments.length === 0) {
      return res.status(404).json({ message: 'تراکنش پرداخت یافت نشد' });
    }
    if (payments.every(({ status }) => status === 'COMPLETED')) {
      return redirectToDashboard(res, 'success');
    }
    if (
      payments.every(({ status }) =>
        ['COMPLETED', 'REFUND_REQUIRED'].includes(status),
      )
    ) {
      return redirectToDashboard(
        res,
        payments.some(({ status }) => status === 'REFUND_REQUIRED')
          ? 'refund-required'
          : 'success',
      );
    }
    const config = getZarinpalConfig();
    if (!config) {
      console.error('Zarinpal callback received without payment configuration');
      return redirectToDashboard(res, 'verification-error');
    }
    const pendingPayments = payments.filter(({ status }) => status === 'PENDING');
    const amountInRial = pendingPayments.reduce(
      (total, payment) => total + payment.amount,
      0,
    );
    if (
      pendingPayments.length === 0 ||
      !Number.isSafeInteger(amountInRial) ||
      pendingPayments.some(({ amount }) => amount % 10 !== 0)
    ) {
      return redirectToDashboard(res, 'verification-error');
    }

    let verification: Awaited<ReturnType<typeof verifyPayment>>;
    try {
      verification = await verifyPayment(config, authority, amountInRial);
    } catch (error) {
      console.error('Zarinpal verification request error:', error);
      return redirectToDashboard(res, 'verification-error');
    }
    if (verification?.code === -21) {
      await db.payment.updateMany({
        where: {
          providerReference: authority,
          method: 'ZARINPAL',
          status: 'PENDING',
        },
        data: { status: 'FAILED' },
      });
      return redirectToDashboard(
        res,
        statusValue === 'OK' ? 'failed' : 'cancelled',
      );
    }
    if (verification?.code !== 100 && verification?.code !== 101) {
      return redirectToDashboard(res, 'verification-error');
    }

    const result = await db.$transaction(async (tx) => {
      const currentPayments = await tx.payment.findMany({
        where: { providerReference: authority, method: 'ZARINPAL' },
        select: {
          id: true,
          amount: true,
          status: true,
          registrationId: true,
          registration: {
            select: {
              status: true,
              totalAmount: true,
              paidAmount: true,
            },
          },
        },
      });
      let refundRequired = currentPayments.some(
        ({ status }) => status === 'REFUND_REQUIRED',
      );

      for (const payment of currentPayments) {
        if (payment.status !== 'PENDING' && payment.status !== 'FAILED') {
          continue;
        }
        const amountInToman = payment.amount / 10;
        const registration = payment.registration;
        if (
          registration.status === 'CANCELLED' ||
          amountInToman > registration.totalAmount - registration.paidAmount
        ) {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: 'REFUND_REQUIRED' },
          });
          refundRequired = true;
          continue;
        }

        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED' },
        });
        await tx.registration.update({
          where: { id: payment.registrationId },
          data: { paidAmount: { increment: amountInToman } },
        });
      }
      return refundRequired;
    }, { isolationLevel: 'Serializable' });

    return redirectToDashboard(
      res,
      result ? 'refund-required' : 'success',
    );
  } catch (error) {
    console.error('Zarinpal payment callback error:', error);
    return redirectToDashboard(res, 'verification-error');
  }
}
