'use server';
import { NextApiRequest, NextApiResponse } from 'next';
import { getPrograms } from '@/services/programService';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const programs = await getPrograms();

    res.status(200).json({
      data: programs,
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ message: 'خطا در دریافت اطلاعات برنامه‌ها' });
  }
}
