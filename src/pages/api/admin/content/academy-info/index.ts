import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();

  switch (req.method) {
    case 'GET': {
      const info = await prisma.academyInfo.findUnique({
        where: { id: 'default' },
      });
      return res.status(200).json(info);
    }
    case 'PUT': {
      const {
        name,
        tagline,
        description,
        phone,
        email,
        privacyEmail,
        address,
        city,
        foundedYear,
        domain,
      } = req.body;

      const info = await prisma.academyInfo.upsert({
        where: { id: 'default' },
        create: {
          id: 'default',
          name: name ?? 'آکادمی فوتبال AP',
          tagline: tagline ?? 'جایی که قهرمانان ساخته می‌شوند',
          description: description ?? '',
          phone: phone ?? '',
          email: email ?? '',
          privacyEmail,
          address: address ?? '',
          city: city ?? '',
          foundedYear,
          domain,
        },
        update: {
          name,
          tagline,
          description,
          phone,
          email,
          privacyEmail,
          address,
          city,
          foundedYear,
          domain,
        },
      });
      return res.status(200).json(info);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}