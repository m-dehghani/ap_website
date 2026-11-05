import { errors, jwtVerify, SignJWT } from 'jose';
import { getJwtSecret } from '@/lib/auth';

const PURPOSE = 'registration-confirmation';
const MAX_LIFETIME_SECONDS = 10 * 60;

export async function createRegistrationConfirmationProof(
  registrationId: string,
  now = new Date(),
): Promise<string> {
  const issuedAt = Math.floor(now.getTime() / 1_000);
  return new SignJWT({
    purpose: PURPOSE,
    registrationId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + MAX_LIFETIME_SECONDS)
    .sign(getJwtSecret());
}

export async function verifyRegistrationConfirmationProof(
  proof: string,
  now = new Date(),
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(proof, getJwtSecret(), {
      algorithms: ['HS256'],
      currentDate: now,
    });
    if (
      payload.purpose !== PURPOSE ||
      typeof payload.registrationId !== 'string' ||
      !payload.registrationId ||
      typeof payload.iat !== 'number' ||
      typeof payload.exp !== 'number' ||
      payload.exp <= payload.iat ||
      payload.exp - payload.iat > MAX_LIFETIME_SECONDS ||
      payload.iat > Math.floor(now.getTime() / 1_000)
    ) {
      return null;
    }
    return payload.registrationId;
  } catch (error) {
    if (error instanceof errors.JOSEError) return null;
    throw error;
  }
}
