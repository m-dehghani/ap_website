// @vitest-environment node

import { Readable } from 'node:stream';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/uploads';
import { getSession, requireRole } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { readImageFile, saveUploadedImage } from '@/lib/uploads';

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
  requireRole: vi.fn(),
}));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const png = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);

function request(
  scope: string,
  body = png,
  headers: Record<string, string> = { 'content-type': 'image/png' },
) {
  const req = Readable.from(body.length ? [body] : []);
  Object.assign(req, {
    method: 'POST',
    query: { scope },
    headers,
    cookies: { auth_token: 'token' },
  });
  return req as never;
}

function response() {
  return {
    headers: {} as Record<string, string>,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

const prisma = {
  user: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  coach: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  successStory: { findFirst: vi.fn() },
  testimonial: { findFirst: vi.fn() },
  newsArticle: { findFirst: vi.fn() },
  shopProduct: { findFirst: vi.fn() },
  $transaction: vi.fn(),
};

describe('/api/uploads', () => {
  let directory: string;

  beforeEach(async () => {
    vi.resetAllMocks();
    directory = await mkdtemp(path.join(os.tmpdir(), 'ap-upload-api-'));
    vi.stubEnv('UPLOADS_DIR', directory);
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    vi.mocked(getSession).mockResolvedValue({
      id: 'student-1',
      role: 'STUDENT',
      source: 'user',
    });
    vi.mocked(requireRole).mockImplementation(async (_req, res, roles) => {
      const session = await getSession(_req);
      if (session && roles.includes(session.role)) return session;
      res.status(session ? 403 : 401).json({ message: 'دسترسی مجاز نیست' });
      return null;
    });
    prisma.user.findUnique.mockResolvedValue({
      image: '/api/uploads/550e8400-e29b-41d4-a716-446655440000.png',
    });
    prisma.user.update.mockResolvedValue({ image: '/api/uploads/generated-id.png' });
    for (const model of [
      prisma.user,
      prisma.coach,
      prisma.successStory,
      prisma.testimonial,
      prisma.newsArticle,
      prisma.shopProduct,
    ]) {
      if ('findFirst' in model) model.findFirst.mockResolvedValue(null);
    }
    prisma.$transaction.mockImplementation((callback) =>
      (callback as (tx: typeof prisma) => Promise<unknown>)(prisma),
    );
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(directory, { recursive: true, force: true });
  });

  it('rejects profile uploads without a session before persisting bytes', async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const res = response();

    await handler(request('profile'), res as never);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects CMS uploads for a student before persisting bytes', async () => {
    const res = response();

    await handler(request('testimonial'), res as never);

    expect(requireRole).toHaveBeenCalledWith(
      expect.anything(),
      res,
      ['ADMIN'],
    );
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows shop managers to upload product images to disk', async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: 'manager-1',
      role: 'SHOP_MANAGER',
      source: 'user',
    });
    const res = response();

    await handler(request('shop-product'), res as never);

    expect(requireRole).toHaveBeenCalledWith(
      expect.anything(),
      res,
      ['ADMIN', 'SHOP_MANAGER'],
    );
    expect(res.status).toHaveBeenCalledWith(201);
    const url = res.json.mock.calls[0][0].url;
    await expect(readImageFile(url)).resolves.toEqual({
      contentType: 'image/png',
      data: png,
    });
  });

  it('stores the profile image on disk, updates its path, and removes the replaced file', async () => {
    const oldImage = await saveUploadedImage('image/png', png);
    prisma.user.findUnique.mockResolvedValue({ image: oldImage });
    const res = response();

    await handler(request('profile'), res as never);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'student-1' },
      data: { image: expect.stringMatching(/^\/api\/uploads\/[a-f0-9-]+\.png$/) },
      select: { image: true },
    });
    expect(await readImageFile(oldImage)).toBeNull();
    const newImage = prisma.user.update.mock.calls[0][0].data.image;
    await expect(readImageFile(newImage!)).resolves.toEqual({
      contentType: 'image/png',
      data: png,
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updates the authenticated coach record without accepting a client identity', async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: 'coach-2',
      role: 'COACH',
      source: 'coach',
    });
    prisma.coach.findUnique.mockResolvedValue({ image: null });
    const res = response();

    await handler(request('profile'), res as never);

    expect(prisma.coach.update).toHaveBeenCalledWith({
      where: { id: 'coach-2' },
      data: { image: expect.stringMatching(/^\/api\/uploads\/[a-f0-9-]+\.png$/) },
      select: { image: true },
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects a declared oversized body before reading or storing it', async () => {
    const res = response();

    await handler(
      request('profile', png, {
        'content-type': 'image/png',
        'content-length': String(5 * 1024 * 1024 + 1),
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(413);
  });
});
