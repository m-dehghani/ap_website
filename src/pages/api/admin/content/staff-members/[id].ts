import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';
import { deleteUnreferencedImage, isValidImageReference } from '@/lib/uploads';

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
      const current = await prisma.staffMember.findUnique({ where: { id } });
      if (!current) return res.status(404).json({ error: 'Not found' });

      const { name, role, bio, initials, image, isActive, displayOrder } =
        req.body;
      const profileImage =
        image === undefined
          ? current.image
          : typeof image === 'string' && image.length > 0
            ? image
            : null;
      if (
        !(await isValidImageReference(prisma, profileImage, [current.image]))
      ) {
        return res.status(400).json({ error: 'تصویر عضو تیم معتبر نیست' });
      }
      const member = await prisma.staffMember.update({
        where: { id },
        data: {
          name,
          role,
          bio,
          initials,
          image: profileImage,
          isActive,
          displayOrder,
        },
      });
      if (current.image !== profileImage) {
        await deleteUnreferencedImage(prisma, current.image);
      }
      return res.status(200).json(member);
    }
    case 'DELETE': {
      const current = await prisma.staffMember.findUnique({ where: { id } });
      if (!current) return res.status(404).json({ error: 'Not found' });
      await prisma.staffMember.delete({
        where: { id },
      });
      await deleteUnreferencedImage(prisma, current.image);
      return res.status(204).end();
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}