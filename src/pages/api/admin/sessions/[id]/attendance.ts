import type { NextApiRequest, NextApiResponse } from 'next';
import { authorizeAdmin } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import {
  attendanceRequestSchema,
  saveAttendance,
} from '@/lib/attendance';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await authorizeAdmin(req, res))) return;
  if (req.method !== 'POST' && req.method !== 'PUT') {
    res.setHeader('Allow', ['POST', 'PUT']);
    return res.status(405).json({ message: 'متد درخواست پشتیبانی نمی‌شود' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'شناسه جلسه معتبر نیست' });
  }
  const parsed = attendanceRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'اطلاعات حضور و غیاب معتبر نیست' });
  }

  const prisma = await getPrisma();
  const session = await prisma.session.findUnique({
    where: { id },
    select: { id: true, programId: true },
  });
  if (!session) {
    return res.status(404).json({ message: 'جلسه پیدا نشد' });
  }

  const result = await saveAttendance(
    prisma,
    session.id,
    session.programId,
    parsed.data.attendance,
  );
  if ('missingUsers' in result) {
    return res
      .status(400)
      .json({ message: 'همه دانش‌آموزان باید در برنامه این جلسه ثبت‌نام کرده باشند' });
  }
  return res.status(200).json({ attendance: result.records });
}
