import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  switch (req.method) {
    case 'GET': {
      const member = await prisma.staffMember.findUnique({
        where: { id },
      });
      if (!member) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json(member);
    }
    case 'PUT': {
      const { name, role, bio, initials, isActive, displayOrder } = req.body;
      const member = await prisma.staffMember.update({
        where: { id },
        data: {
          name,
          role,
          bio,
          initials,
          isActive,
          displayOrder,
        },
      });
      return res.status(200).json(member);
    }
    case 'DELETE': {
      await prisma.staffMember.delete({
        where: { id },
      });
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}