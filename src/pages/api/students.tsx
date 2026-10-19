import { NextApiRequest, NextApiResponse } from 'next';
import { getPrisma } from '../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const programId = req.query['programId'];
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  if (!programId || typeof programId !== 'string') {
    return res.status(400).json({ message: 'programId is not provided' });
  }
  try {
    const prisma = await getPrisma();
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: { registrations: true },
    });

    if (!program) {
      return res.status(404).json({ message: 'برنامه آموزشی یافت نشد' });
    }

    res.status(201).json({
      data: program,
    });
  } catch (error) {
    console.error('Get program error:', error);

    res.status(500).json({ message: 'خطا' });
  }
}
