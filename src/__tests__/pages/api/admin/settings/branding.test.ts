// @vitest-environment node

import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/admin/settings/branding';
import { authorizeAdmin } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { readMediaFile, saveUploadedMedia } from '@/lib/media';

vi.mock('@/lib/auth', () => ({ authorizeAdmin: vi.fn() }));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const request = (method: string, body?: unknown) => ({ method, body }) as never;
const response = () =>
  ({
    headers: {} as Record<string, string>,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }) as never as {
    headers: Record<string, string>;
    setHeader: (name: string, value: string) => void;
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };

describe('/api/admin/settings/branding', () => {
  let directory: string;
  const prisma = {
    siteBranding: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
    },
    newsArticle: { findFirst: vi.fn() },
    shopProduct: { findFirst: vi.fn() },
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    directory = await mkdtemp(path.join(os.tmpdir(), 'ap-branding-api-'));
    vi.stubEnv('UPLOADS_DIR', directory);
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '');
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('NODE_ENV', 'test');
    vi.mocked(authorizeAdmin).mockResolvedValue(true);
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    prisma.siteBranding.findUnique.mockResolvedValue({ logoUrl: null });
    prisma.siteBranding.findFirst.mockResolvedValue(null);
    prisma.newsArticle.findFirst.mockResolvedValue(null);
    prisma.shopProduct.findFirst.mockResolvedValue(null);
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(directory, { recursive: true, force: true });
  });

  it('requires admin authorization before returning or mutating branding', async () => {
    vi.mocked(authorizeAdmin).mockResolvedValue(false);
    const res = response();

    await handler(request('GET'), res as never);

    expect(prisma.siteBranding.findUnique).not.toHaveBeenCalled();
  });

  it('rejects arbitrary logo URLs without changing the saved branding', async () => {
    const res = response();

    await handler(
      request('PUT', { logoUrl: 'https://outside.example/logo.png' }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.siteBranding.upsert).not.toHaveBeenCalled();
  });

  it('replaces a verified logo and removes the previous asset only after saving', async () => {
    const oldLogo = await saveUploadedMedia('image/png', png);
    const newLogo = await saveUploadedMedia('image/png', png);
    prisma.siteBranding.findUnique.mockResolvedValueOnce({ logoUrl: oldLogo });
    prisma.siteBranding.upsert.mockResolvedValue({ logoUrl: newLogo });
    const res = response();

    await handler(request('PUT', { logoUrl: newLogo }), res as never);

    expect(prisma.siteBranding.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { logoUrl: newLogo } }),
    );
    await expect(readMediaFile(oldLogo)).resolves.toBeNull();
    await expect(readMediaFile(newLogo)).resolves.not.toBeNull();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('clears the current logo on removal and returns a safe fallback reference', async () => {
    const logoUrl = await saveUploadedMedia('image/png', png);
    prisma.siteBranding.findUnique.mockResolvedValue({ logoUrl });
    const res = response();

    await handler(request('DELETE'), res as never);

    expect(prisma.siteBranding.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { logoUrl: null } }),
    );
    expect(res.json).toHaveBeenCalledWith({ logoUrl: null });
    await expect(readMediaFile(logoUrl)).resolves.toBeNull();
  });
});
