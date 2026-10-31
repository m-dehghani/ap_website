// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/uploads/[id]';
import { getPrisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const imageBytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47]);

const prisma = {
  imageAsset: { findUnique: vi.fn() },
};

function response() {
  return {
    headers: {} as Record<string, string>,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
}

describe('/api/uploads/[id]', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
  });

  it('serves image bytes read from the durable asset record with safe headers', async () => {
    prisma.imageAsset.findUnique.mockResolvedValue({
      contentType: 'image/png',
      data: imageBytes,
    });
    const res = response();

    await handler(
      { method: 'GET', query: { id: '550e8400-e29b-41d4-a716-446655440000' } } as never,
      res as never,
    );

    expect(prisma.imageAsset.findUnique).toHaveBeenCalledWith({
      where: { id: '550e8400-e29b-41d4-a716-446655440000' },
      select: { contentType: true, data: true },
    });
    expect(res.headers).toMatchObject({
      'Content-Type': 'image/png',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    expect(res.send).toHaveBeenCalledWith(Buffer.from(imageBytes));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('does not query storage with an unsafe or malformed asset key', async () => {
    const res = response();

    await handler(
      { method: 'GET', query: { id: '../private-file' } } as never,
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(prisma.imageAsset.findUnique).not.toHaveBeenCalled();
  });
});
