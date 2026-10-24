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
      const { isActive } = req.query;
      const where: Record<string, unknown> = {};
      if (isActive !== undefined) where.isActive = isActive === 'true';
      const staff = await prisma.staffMember.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
      });
      return res.status(200).json(staff);
    }
    case 'POST': {
      const { name, role, bio, initials, isActive, displayOrder } = req.body;
      if (!name || !role || !bio || !initials) {
        return res.status(400).json({ error: 'فیلدهای الزامی: name, role, bio, initials' });
      }
      const member = await prisma.staffMember.create({
        data: {
          name,
          role,
          bio,
          initials,
          isActive: isActive ?? true,
          displayOrder: displayOrder ?? 0,
        },
      });
      return res.status(201).json(member);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}