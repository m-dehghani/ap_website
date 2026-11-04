import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { authorizeAdmin } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import {
  deleteUnreferencedMedia,
  isValidUploadedLogoReference,
  uploadedLogoUrlSchema,
} from '@/lib/media';

const brandingInputSchema = z.object({
  logoUrl: uploadedLogoUrlSchema.nullable(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeAdmin(req, res))) return;
  const db = await getPrisma();

  if (req.method === 'GET') {
    const branding = await db.siteBranding.findUnique({
      where: { id: 'default' },
      select: { logoUrl: true },
    });
    const logoUrl = uploadedLogoUrlSchema.safeParse(branding?.logoUrl).success
      ? branding?.logoUrl ?? null
      : null;
    return res.status(200).json({ logoUrl });
  }
  if (req.method === 'PUT') {
    const parsed = brandingInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'نشانی لوگو معتبر نیست' });
    }

    const current = await db.siteBranding.findUnique({
      where: { id: 'default' },
      select: { logoUrl: true },
    });
    if (!(await isValidUploadedLogoReference(parsed.data.logoUrl, [current?.logoUrl]))) {
      return res.status(400).json({ message: 'لوگو باید از بخش بارگذاری انتخاب شود' });
    }
    const updated = await db.siteBranding.upsert({
      where: { id: 'default' },
      create: { id: 'default', logoUrl: parsed.data.logoUrl },
      update: { logoUrl: parsed.data.logoUrl },
      select: { logoUrl: true },
    });
    if (current?.logoUrl && current.logoUrl !== updated.logoUrl) {
      await deleteUnreferencedMedia(db, current.logoUrl);
    }
    return res.status(200).json({ logoUrl: updated.logoUrl });
  }
  if (req.method === 'DELETE') {
    const current = await db.siteBranding.findUnique({
      where: { id: 'default' },
      select: { logoUrl: true },
    });
    if (current?.logoUrl) {
      await db.siteBranding.update({
        where: { id: 'default' },
        data: { logoUrl: null },
      });
      await deleteUnreferencedMedia(db, current.logoUrl);
    }
    return res.status(200).json({ logoUrl: null });
  }
  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ message: 'روش درخواست پشتیبانی نمی‌شود' });
}
