import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { authorizeAdmin } from '@/lib/auth';
import { encryptPaymentCredential, isPaymentConfigEncryptionKeyReady } from '@/lib/payment-config-crypto';
import { getAdminGatewaySettings } from '@/lib/payment-gateways';
import { getPrisma } from '@/lib/db';
import { CHECKOUT_TTL_MS } from '@/lib/payments';

const updateSchema = z
  .object({
    provider: z.enum(['ZARINPAL', 'ZIBAL']),
    enabled: z.boolean(),
    isDefault: z.boolean(),
    credential: z.string().trim().min(1).max(500).optional(),
    clearCredential: z.boolean().optional().default(false),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.credential && value.clearCredential) {
      ctx.addIssue({
        code: 'custom',
        path: ['clearCredential'],
        message: 'Credential replacement and removal cannot be combined',
      });
    }
    if (value.clearCredential && (value.enabled || value.isDefault)) {
      ctx.addIssue({
        code: 'custom',
        path: ['clearCredential'],
        message: 'Disable and unselect a gateway before removing its credential',
      });
    }
    if (value.isDefault && !value.enabled) {
      ctx.addIssue({
        code: 'custom',
        path: ['isDefault'],
        message: 'The default gateway must be enabled',
      });
    }
  });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeAdmin(req, res))) return;
  if (req.method !== 'GET' && req.method !== 'PUT') {
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (req.method === 'PUT' && !isPaymentConfigEncryptionKeyReady()) {
    return res.status(503).json({
      message: 'کلید رمزنگاری تنظیمات پرداخت در محیط سرور پیکربندی نشده است.',
    });
  }

  try {
    const db = await getPrisma();
    if (req.method === 'GET') {
      return res.status(200).json(await getAdminGatewaySettings(db));
    }

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'تنظیمات درگاه معتبر نیست.' });
    }
    const input = parsed.data;

    const outcome = await db.$transaction(async (tx) => {
      const current = await tx.paymentGatewayConfig.findUnique({
        where: { provider: input.provider },
        select: {
          provider: true,
          enabled: true,
          isDefault: true,
          encryptedCredential: true,
        },
      });

      if (current?.isDefault && !input.isDefault) {
        return { kind: 'default' as const };
      }

      let encryptedCredential = current?.encryptedCredential ?? null;
      if (input.clearCredential || input.credential) {
        const callbackWindowStart = new Date(
          Date.now() - CHECKOUT_TTL_MS,
        );
        const paymentCallbackWindow = {
          OR: [
            { expiresAt: { gt: callbackWindowStart } },
            { expiresAt: null, createdAt: { gt: callbackWindowStart } },
          ],
        };
        const orderCallbackWindow = {
          expiresAt: { gt: callbackWindowStart },
        };
        const [pendingPayments, unresolvedOrders] = await Promise.all([
          tx.payment.count({
            where: {
              provider: input.provider,
              status: { in: ['PENDING', 'FAILED'] },
              ...paymentCallbackWindow,
            },
          }),
          tx.shopOrder.count({
            where: {
              provider: input.provider,
              status: {
                in: ['PENDING_PAYMENT', 'PAYMENT_FAILED', 'CANCELLED'],
              },
              ...orderCallbackWindow,
            },
          }),
        ]);
        if (pendingPayments > 0 || unresolvedOrders > 0) {
          return { kind: 'pending-transactions' as const };
        }
      }

      if (input.clearCredential) {
        if (!encryptedCredential) return { kind: 'no-stored-credential' as const };
        encryptedCredential = null;
      } else if (input.credential) {
        encryptedCredential = encryptPaymentCredential(input.credential);
      } else if (!encryptedCredential && input.provider === 'ZARINPAL') {
        const environmentCredential = process.env.ZARINPAL_MERCHANT_ID;
        if (environmentCredential) {
          encryptedCredential = encryptPaymentCredential(environmentCredential);
        }
      }

      if (input.enabled && !encryptedCredential) {
        return { kind: 'credential-required' as const };
      }
      if (input.isDefault && !encryptedCredential) {
        return { kind: 'credential-required' as const };
      }

      if (input.isDefault) {
        await tx.paymentGatewayConfig.updateMany({
          where: { provider: { not: input.provider }, isDefault: true },
          data: { isDefault: false },
        });
      }

      await tx.paymentGatewayConfig.upsert({
        where: { provider: input.provider },
        create: {
          provider: input.provider,
          enabled: input.enabled,
          isDefault: input.isDefault,
          encryptedCredential,
        },
        update: {
          enabled: input.enabled,
          isDefault: input.isDefault,
          encryptedCredential,
        },
      });
      return { kind: 'saved' as const };
    });

    if (outcome.kind === 'default') {
      return res.status(409).json({
        message: 'ابتدا درگاه دیگری را به‌عنوان پیش‌فرض انتخاب کنید.',
      });
    }
    if (outcome.kind === 'no-stored-credential') {
      return res.status(409).json({
        message: 'کلید این درگاه در پایگاه داده ذخیره نشده است و قابل حذف نیست.',
      });
    }
    if (outcome.kind === 'pending-transactions') {
      return res.status(409).json({
        message: 'تا پایان بازه دریافت پاسخ درگاه برای تراکنش‌های اخیر، تغییر کلید مجاز نیست.',
      });
    }
    if (outcome.kind === 'credential-required') {
      return res.status(400).json({
        message: 'برای فعال‌سازی یا پیش‌فرض‌کردن درگاه، کلید پذیرنده لازم است.',
      });
    }

    return res.status(200).json({
      message: 'تنظیمات درگاه ذخیره شد.',
      ...(await getAdminGatewaySettings(db)),
    });
  } catch {
    console.error('Admin payment gateway settings operation failed');
    return res.status(500).json({ message: 'ذخیره تنظیمات درگاه ناموفق بود.' });
  }
}
