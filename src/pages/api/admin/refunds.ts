import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { authorizeAdmin } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

const refundTransitionSchema = z.object({
  type: z.enum(['payment', 'shopOrder']),
  id: z.string().trim().min(1),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeAdmin(req, res))) return;
  if (req.method !== 'GET' && req.method !== 'PATCH') {
    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const prisma = await getPrisma();
    if (req.method === 'GET') {
      const [payments, orders] = await Promise.all([
        prisma.payment.findMany({
          where: { status: 'REFUND_REQUIRED' },
          select: {
            id: true,
            amount: true,
            currency: true,
            method: true,
            providerReference: true,
            createdAt: true,
            user: {
              select: { firstName: true, lastName: true, phone: true },
            },
            registration: {
              select: { program: { select: { name: true } } },
            },
          },
        }),
        prisma.shopOrder.findMany({
          where: { status: 'REFUND_REQUIRED' },
          select: {
            id: true,
            orderNumber: true,
            fullName: true,
            phone: true,
            totalAmount: true,
            createdAt: true,
            items: { select: { productName: true, quantity: true } },
          },
        }),
      ]);

      const data = [
        ...payments.map((payment) => ({
          id: payment.id,
          type: 'payment' as const,
          customerName: `${payment.user.firstName} ${payment.user.lastName}`.trim(),
          phone: payment.user.phone,
          description: payment.registration.program.name,
          reference: payment.providerReference ?? payment.id,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          createdAt: payment.createdAt,
        })),
        ...orders.map((order) => ({
          id: order.id,
          type: 'shopOrder' as const,
          customerName: order.fullName,
          phone: order.phone,
          description: order.items
            .map((item) => `${item.productName} (${item.quantity})`)
            .join('، '),
          reference: order.orderNumber,
          amount: order.totalAmount,
          currency: 'TOMAN',
          method: 'فروشگاه',
          createdAt: order.createdAt,
        })),
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return res.status(200).json({ data });
    }

    const parsed = refundTransitionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'درخواست بازپرداخت معتبر نیست' });
    }

    const updated =
      parsed.data.type === 'payment'
        ? await prisma.payment.updateMany({
            where: { id: parsed.data.id, status: 'REFUND_REQUIRED' },
            data: { status: 'REFUNDED' },
          })
        : await prisma.shopOrder.updateMany({
            where: { id: parsed.data.id, status: 'REFUND_REQUIRED' },
            data: { status: 'REFUNDED' },
          });
    if (!updated.count) {
      return res.status(409).json({
        message: 'این مورد دیگر در صف بازپرداخت نیست یا قبلاً پیگیری شده است',
      });
    }

    return res.status(200).json({
      message: 'وضعیت بازپرداخت ثبت شد؛ انجام پرداخت باید خارج از سامانه باشد',
    });
  } catch (error) {
    console.error('Admin refund queue error:', error);
    return res.status(500).json({ message: 'بارگذاری یا ثبت بازپرداخت ناموفق بود' });
  }
}
