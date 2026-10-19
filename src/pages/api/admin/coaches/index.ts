import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '@/lib/db';
import { authorizeAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await authorizeAdmin(req, res))) return;
  const prisma = await getPrisma();

  switch (req.method) {
    case 'GET': {
      const coaches = await prisma.coach.findMany({
        include: {
          programs: true,
        },
        orderBy: { displayOrder: 'asc' },
      });
      return res.status(200).json(
        coaches.map(({ password: _, ...coach }) => coach),
      );
    }
    case 'POST': {
      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        specialization,
        experience,
        title,
        bio,
        quote,
        certifications,
        achievements,
        rating,
        studentsCount,
        image,
        instagram,
        twitter,
        isActive,
        displayOrder,
      } = req.body;

      if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'رمز عبور باید حداقل ۶ کاراکتر باشد' });
      }

      const coach = await prisma.coach.create({
        data: {
          firstName,
          lastName,
          email,
          password: await bcrypt.hash(password, 10),
          phone,
          specialization,
          experience,
          title,
          bio,
          quote,
          certifications: certifications ?? [],
          achievements: achievements ?? [],
          rating: rating ?? 0,
          studentsCount: studentsCount ?? 0,
          image,
          instagram,
          twitter,
          isActive: isActive ?? true,
          displayOrder: displayOrder ?? 0,
        },
        include: {
          programs: true,
        },
      });
      const { password: _, ...safeCoach } = coach;
      return res.status(201).json(safeCoach);
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}