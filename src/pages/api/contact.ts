import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getPrisma } from '@/lib/db';

const contactSubmissionSchema = z.object({
  firstName: z.string().trim().min(1, 'وارد کردن نام الزامی است').max(100),
  lastName: z
    .string()
    .trim()
    .min(1, 'وارد کردن نام خانوادگی الزامی است')
    .max(100),
  email: z.string().trim().email('ایمیل معتبر نیست').max(254),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  message: z.string().trim().min(1, 'وارد کردن پیام الزامی است').max(5000),
  company: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'روش درخواست پشتیبانی نمی‌شود' });
  }

  const honeypot =
    typeof req.body?.company === 'string' ? req.body.company.trim() : '';
  if (honeypot) {
    return res.status(400).json({ message: 'اطلاعات فرم معتبر نیست.' });
  }

  const parsed = contactSubmissionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'لطفاً اطلاعات واردشده را بررسی کنید.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const { firstName, lastName, email, phone, message } = parsed.data;
    await (await getPrisma()).contactMessage.create({
      data: { firstName, lastName, email, phone: phone || null, message },
      select: { id: true },
    });

    return res.status(201).json({ message: 'پیام شما با موفقیت ثبت شد.' });
  } catch (error) {
    console.error(
      'Contact message persistence failed:',
      error instanceof Error ? error.name : 'Unknown error',
    );
    return res.status(500).json({
      message: 'ثبت پیام با خطا روبه‌رو شد. لطفاً دوباره تلاش کنید.',
    });
  }
}
