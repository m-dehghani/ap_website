// @vitest-environment node

import { Readable } from 'node:stream';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/uploads/video';
import { getSession, requireRole } from '@/lib/auth';
import { readVideoFile } from '@/lib/media';

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
  requireRole: vi.fn(),
}));

const mp4 = Buffer.from([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);

function request(scope: string, body = mp4, headers: Record<string, string> = {}) {
  const req = Readable.from(body.length ? [body] : []);
  Object.assign(req, {
    method: 'POST',
    query: { scope },
    headers: {
      'content-type': 'video/mp4',
      'content-length': String(body.byteLength),
      'x-upload-filename': 'training.mp4',
      ...headers,
    },
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

describe('/api/uploads/video', () => {
  let directory: string;

  beforeEach(async () => {
    vi.resetAllMocks();
    directory = await mkdtemp(path.join(os.tmpdir(), 'ap-video-api-'));
    vi.stubEnv('UPLOADS_DIR', directory);
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '');
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('NODE_ENV', 'test');
    vi.mocked(getSession).mockResolvedValue({
      id: 'manager-1',
      role: 'SHOP_MANAGER',
      source: 'user',
    });
    vi.mocked(requireRole).mockImplementation(async (_req, res, roles) => {
      const session = await getSession(_req);
      if (session && roles.includes(session.role)) return session;
      res.status(session ? 403 : 401).json({ message: 'دسترسی مجاز نیست' });
      return null;
    });
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(directory, { recursive: true, force: true });
  });

  it('lets product editors upload a validated file and returns its stable URL', async () => {
    const res = response();

    await handler(request('product'), res as never);

    expect(requireRole).toHaveBeenCalledWith(
      expect.anything(),
      res,
      ['ADMIN', 'SHOP_MANAGER'],
    );
    expect(res.status).toHaveBeenCalledWith(201);
    const url = res.json.mock.calls[0][0].url;
    await expect(readVideoFile(url)).resolves.toMatchObject({
      contentType: 'video/mp4',
      data: mp4,
    });
  });

  it('requires an administrator for news-video uploads', async () => {
    const res = response();

    await handler(request('news'), res as never);

    expect(requireRole).toHaveBeenCalledWith(expect.anything(), res, ['ADMIN']);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('rejects a declared oversized body before reading or persisting it', async () => {
    const res = response();

    await handler(
      request('product', mp4, {
        'content-length': String(100 * 1024 * 1024 + 1),
      }),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(413);
  });

  it('rejects a MIME or signature mismatch before writing', async () => {
    const res = response();

    await handler(
      request('product', Buffer.from('not a video')),
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) }),
    );
  });
});
