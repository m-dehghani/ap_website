// @vitest-environment node

import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/profile/image';
import { getSession } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { readImageFile, saveUploadedImage } from '@/lib/uploads';

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/db', () => ({ getPrisma: vi.fn() }));

const png = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);

const request = (image: string) =>
  ({ method: 'PATCH', body: { image }, cookies: { auth_token: 'token' } }) as never;

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
  staffMember: { findFirst: vi.fn() },
  successStory: { findFirst: vi.fn() },
  testimonial: { findFirst: vi.fn() },
  newsArticle: { findFirst: vi.fn() },
  shopProduct: { findFirst: vi.fn() },
  $transaction: vi.fn(),
};

describe('/api/profile/image', () => {
  let directory: string;

  beforeEach(async () => {
    vi.resetAllMocks();
    directory = await mkdtemp(path.join(os.tmpdir(), 'ap-profile-image-'));
    vi.stubEnv('UPLOADS_DIR', directory);
    vi.mocked(getPrisma).mockResolvedValue(prisma as never);
    vi.mocked(getSession).mockResolvedValue({
      id: 'student-1',
      role: 'STUDENT',
      source: 'user',
    });
    prisma.user.findUnique.mockResolvedValue({ image: null });
    prisma.coach.findUnique.mockResolvedValue({ image: null });
    prisma.user.update.mockImplementation(async ({ data }) => ({
      image: data.image,
    }));
    prisma.coach.update.mockImplementation(async ({ data }) => ({
      image: data.image,
    }));
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

  it('requires an authenticated account before saving a profile image', async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    const res = response();

    await handler(request('/api/uploads/550e8400-e29b-41d4-a716-446655440000.png'), res as never);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('saves the uploaded image only after confirmation and removes the replaced file', async () => {
    const oldImage = await saveUploadedImage('image/png', png);
    const newImage = await saveUploadedImage('image/png', png);
    prisma.user.findUnique.mockResolvedValue({ image: oldImage });
    const res = response();

    await handler(request(newImage), res as never);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'student-1' },
      data: { image: newImage },
      select: { image: true },
    });
    expect(await readImageFile(oldImage)).toBeNull();
    await expect(readImageFile(newImage)).resolves.toEqual({
      contentType: 'image/png',
      data: png,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ image: newImage });
  });

  it('saves coach images to the authenticated coach record', async () => {
    const image = await saveUploadedImage('image/png', png);
    vi.mocked(getSession).mockResolvedValue({
      id: 'coach-1',
      role: 'COACH',
      source: 'coach',
    });
    const res = response();

    await handler(request(image), res as never);

    expect(prisma.coach.update).toHaveBeenCalledWith({
      where: { id: 'coach-1' },
      data: { image },
      select: { image: true },
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('rejects image references that were not uploaded to the image store', async () => {
    const res = response();

    await handler(
      request('https://images.example.com/profile.jpg'),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
