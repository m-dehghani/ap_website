// @vitest-environment node

import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '@/pages/api/uploads/[id]';
import { readImageFile, saveUploadedImage } from '@/lib/uploads';

const imageBytes = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);

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
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(path.join(os.tmpdir(), 'ap-upload-read-'));
    vi.stubEnv('UPLOADS_DIR', directory);
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(directory, { recursive: true, force: true });
  });

  it('serves image bytes from disk with safe headers', async () => {
    const url = await saveUploadedImage('image/png', imageBytes);
    const res = response();

    await handler(
      { method: 'GET', query: { id: url.split('/').at(-1) } } as never,
      res as never,
    );

    expect(res.headers).toMatchObject({
      'Content-Type': 'image/png',
      'Content-Length': String(imageBytes.byteLength),
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    expect(res.send).toHaveBeenCalledWith(Buffer.from(imageBytes));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 404 for a missing or unsafe disk path', async () => {
    const res = response();

    await handler(
      { method: 'GET', query: { id: '../private-file' } } as never,
      res as never,
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).not.toHaveBeenCalled();
    expect(await readImageFile('/api/uploads/../private-file')).toBeNull();
  });
});
