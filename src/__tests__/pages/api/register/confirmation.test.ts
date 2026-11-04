// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/register/confirmation';
import { getPrisma } from '@/lib/db';
import { verifyRegistrationConfirmationProof } from '@/lib/registration-confirmation';

vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));
vi.mock('@/lib/registration-confirmation', () => ({
  verifyRegistrationConfirmationProof: vi.fn(),
}));

const prisma = {
  registration: { findUnique: vi.fn() },
};

const request = (method: string, body?: unknown) =>
  ({ method, body }) as never;
const response = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
  };
  return res as never as typeof res;
};

describe('/api/register/confirmation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    prisma.registration.findUnique.mockResolvedValue({ id: 'registration-1' });
    vi.mocked(verifyRegistrationConfirmationProof).mockResolvedValue(
      'registration-1',
    );
  });

  it('confirms only a valid proof that references an existing registration', async () => {
    const res = response();
    await handler(request('POST', { proof: 'signed-proof' }), res as never);

    expect(verifyRegistrationConfirmationProof).toHaveBeenCalledWith(
      'signed-proof',
    );
    expect(prisma.registration.findUnique).toHaveBeenCalledWith({
      where: { id: 'registration-1' },
      select: { id: true },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ verified: true });
  });

  it('does not access registration storage for missing, invalid, or oversized proofs', async () => {
    const invalidProofs = [
      undefined,
      { proof: '' },
      { proof: 'x'.repeat(2049) },
    ];

    for (const body of invalidProofs) {
      const res = response();
      await handler(request('POST', body), res as never);
      expect(res.status).toHaveBeenCalledWith(400);
    }

    expect(verifyRegistrationConfirmationProof).not.toHaveBeenCalled();
    expect(getPrisma).not.toHaveBeenCalled();
  });

  it('does not confirm a proof that resolves to no registration', async () => {
    prisma.registration.findUnique.mockResolvedValue(null);
    const res = response();

    await handler(request('POST', { proof: 'signed-proof' }), res as never);

    expect(res.json).toHaveBeenCalledWith({ verified: false });
  });

  it('rejects a proof that fails signature, purpose, or expiry verification', async () => {
    vi.mocked(verifyRegistrationConfirmationProof).mockResolvedValue(null);
    const res = response();

    await handler(request('POST', { proof: 'invalid-proof' }), res as never);

    expect(res.json).toHaveBeenCalledWith({ verified: false });
    expect(getPrisma).not.toHaveBeenCalled();
  });
});
