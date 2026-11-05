import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { CHECKOUT_TTL_MS } from '@/lib/payments';
import { getPaymentGateway } from '@/lib/payment-gateways';
import type { PaymentProviderId } from '@/lib/payment-providers/types';

function redirectToDashboard(res: NextApiResponse, result: string) {
  res.redirect(302, `/student/dashboard?payment=${encodeURIComponent(result)}`);
}

function isPaymentProvider(value: string): value is PaymentProviderId {
  return value === 'ZARINPAL' || value === 'ZIBAL';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const referenceValue =
    req.query.trackId ??
    req.query.Authority ??
    req.query.authority;
  const reference =
    typeof referenceValue === 'string' &&
    /^[a-zA-Z0-9]{1,64}$/.test(referenceValue)
      ? referenceValue
      : null;
  if (!reference) {
    return res.status(400).json({ message: 'شناسه پرداخت معتبر نیست' });
  }

  try {
    const db = await getPrisma();
    const payments = await db.payment.findMany({
      where: { providerReference: reference },
      select: {
        id: true,
        amount: true,
        status: true,
        provider: true,
      },
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

    const provider = payments[0].provider;
    if (
      !isPaymentProvider(provider) ||
      payments.some((payment) => payment.provider !== provider)
    ) {
      return redirectToDashboard(res, 'verification-error');
    }
    const verifiablePayments = payments.filter(({ status }) =>
      ['PENDING', 'FAILED'].includes(status),
    );
    const amountInRial = verifiablePayments.reduce(
      (total, payment) => total + payment.amount,
      0,
    );
    if (
      verifiablePayments.length === 0 ||
      !Number.isSafeInteger(amountInRial) ||
      verifiablePayments.some(({ amount }) => amount % 10 !== 0)
    ) {
      return redirectToDashboard(res, 'verification-error');
    }

    const gateway = await getPaymentGateway(db, provider, {
      allowDisabled: true,
    });
    if (!gateway) return redirectToDashboard(res, 'verification-error');

    let verification: Awaited<ReturnType<typeof gateway.verifyPayment>>;
    try {
      verification = await gateway.verifyPayment(reference, amountInRial);
    } catch {
      console.error('Student payment verification failed');
      return redirectToDashboard(res, 'verification-error');
    }
    if (verification.state === 'not-paid') {
      await db.payment.updateMany({
        where: {
          providerReference: reference,
          provider,
          status: 'PENDING',
        },
        data: { status: 'FAILED' },
      });
      return redirectToDashboard(res, 'failed');
    }

    const result = await db.$transaction(
      async (tx) => {
        const currentPayments = await tx.payment.findMany({
          where: { providerReference: reference, provider },
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            expiresAt: true,
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
        const now = new Date();

        for (const payment of currentPayments) {
          if (payment.status !== 'PENDING' && payment.status !== 'FAILED') {
            continue;
          }
          const amountInToman = payment.amount / 10;
          const registration = payment.registration;
          const expiresAt =
            payment.expiresAt ??
            new Date(payment.createdAt.getTime() + CHECKOUT_TTL_MS);
          if (
            expiresAt <= now ||
            registration.status === 'CANCELLED' ||
            amountInToman >
              registration.totalAmount - registration.paidAmount
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
      },
      { isolationLevel: 'Serializable' },
    );

    return redirectToDashboard(
      res,
      result ? 'refund-required' : 'success',
    );
  } catch {
    console.error('Student payment callback failed');
    return redirectToDashboard(res, 'verification-error');
  }
}
