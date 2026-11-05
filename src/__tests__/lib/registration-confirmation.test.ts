// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SignJWT } from 'jose';
import { createRegistrationConfirmationProof, verifyRegistrationConfirmationProof } from '@/lib/registration-confirmation';
import { getJwtSecret } from '@/lib/auth';

const NOW = new Date('2026-11-05T00:00:00.000Z');

describe('registration confirmation proof', () => {
  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', 'phase-14-registration-proof-test-secret');
  });

  it('signs a registration-only proof with a ten-minute lifetime', async () => {
    const proof = await createRegistrationConfirmationProof('registration-1', NOW);

    await expect(
      verifyRegistrationConfirmationProof(proof, new Date(NOW.getTime() + 599_000)),
    ).resolves.toBe('registration-1');
    await expect(
      verifyRegistrationConfirmationProof(proof, new Date(NOW.getTime() + 601_000)),
    ).resolves.toBeNull();
  });

  it('rejects malformed, tampered, and incorrectly purposed proofs', async () => {
    const valid = await createRegistrationConfirmationProof('registration-1', NOW);
    const wrongPurpose = await new SignJWT({
      purpose: 'another-purpose',
      registrationId: 'registration-1',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(Math.floor(NOW.getTime() / 1000))
      .setExpirationTime(Math.floor(NOW.getTime() / 1000) + 600)
      .sign(getJwtSecret());

    await expect(
      verifyRegistrationConfirmationProof(`${valid.slice(0, -1)}x`, NOW),
    ).resolves.toBeNull();
    await expect(
      verifyRegistrationConfirmationProof('not-a-jwt', NOW),
    ).resolves.toBeNull();
    await expect(
      verifyRegistrationConfirmationProof(wrongPurpose, NOW),
    ).resolves.toBeNull();
  });

  it('rejects proofs that claim a lifetime greater than ten minutes', async () => {
    const issuedAt = Math.floor(NOW.getTime() / 1000);
    const tooLong = await new SignJWT({
      purpose: 'registration-confirmation',
      registrationId: 'registration-1',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(issuedAt)
      .setExpirationTime(issuedAt + 601)
      .sign(getJwtSecret());

    await expect(
      verifyRegistrationConfirmationProof(tooLong, NOW),
    ).resolves.toBeNull();
  });
});
