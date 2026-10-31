import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { authorizeAdmin } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

const updateMessageSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(['NEW', 'READ', 'ANSWERED']),
  expectedStatus: z.enum(['NEW', 'READ', 'ANSWERED']),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeAdmin(req, res))) return;
  if (req.method !== 'GET' && req.method !== 'PATCH') {
    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ message: 'روش درخواست پشتیبانی نمی‌شود' });
  }

  try {
    const prisma = await getPrisma();
    if (req.method === 'GET') {
      const data = await prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          message: true,
          status: true,
          createdAt: true,
        },
      });
      return res.status(200).json({ data });
    }

    const parsed = updateMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'وضعیت پیام معتبر نیست.' });
    }

    const updated = await prisma.contactMessage.updateMany({
      where: { id: parsed.data.id, status: parsed.data.expectedStatus },
      data: { status: parsed.data.status },
    });
    if (!updated.count) {
      return res.status(409).json({
        message: 'وضعیت پیام تغییر کرده است. صندوق را دوباره بارگذاری کنید.',
      });
    }

    return res.status(200).json({ message: 'وضعیت پیام به‌روزرسانی شد.' });
  } catch (error) {
    console.error(
      'Admin contact inbox operation failed:',
      error instanceof Error ? error.name : 'Unknown error',
    );
    return res.status(500).json({ message: 'انجام درخواست ناموفق بود.' });
  }
}
