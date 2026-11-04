import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getPrisma } from '@/lib/db';
import { verifyRegistrationConfirmationProof } from '@/lib/registration-confirmation';

const requestSchema = z.object({
  proof: z.string().min(1).max(2048),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ verified: false });
  }

  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ verified: false });

  try {
    const registrationId = await verifyRegistrationConfirmationProof(
      parsed.data.proof,
    );
    if (!registrationId) return res.status(200).json({ verified: false });

    const db = await getPrisma();
    const registration = await db.registration.findUnique({
      where: { id: registrationId },
      select: { id: true },
    });
    return res.status(200).json({ verified: Boolean(registration) });
  } catch (error) {
    console.error(
      'Registration confirmation verification failed:',
      error instanceof Error ? error.name : 'Unknown error',
    );
    return res.status(503).json({ verified: false });
  }
}
