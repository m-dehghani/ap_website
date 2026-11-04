// @vitest-environment node

import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getMaxVideoUploadBytes,
  getAparatEmbedUrl,
  deleteUnreferencedMedia,
  parseByteRange,
  parseAparatVideoUrl,
  readVideoFile,
  saveUploadedVideo,
  validateVideoUpload,
} from '@/lib/media';

const mp4 = Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);
const webm = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x93, 0x42, 0x82, 0x88]);

describe('video media boundary', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(path.join(os.tmpdir(), 'ap-video-media-'));
    vi.stubEnv('UPLOADS_DIR', directory);
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '');
    vi.stubEnv('BLOB_STORE_ID', '');
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('NODE_ENV', 'test');
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(directory, { recursive: true, force: true });
  });

  it('uses the 4 MiB Vercel cap and permits exactly the limit', () => {
    vi.stubEnv('VERCEL', '1');
    const limit = 4 * 1024 * 1024;
    expect(getMaxVideoUploadBytes()).toBe(limit);
    expect(validateVideoUpload('training.mp4', 'video/mp4', Buffer.concat([mp4, Buffer.alloc(limit - mp4.length)]))).toEqual({
      contentType: 'video/mp4',
      extension: 'mp4',
    });
    expect(validateVideoUpload('training.mp4', 'video/mp4', Buffer.alloc(limit + 1))).toBeNull();
  });

  it('uses the 100 MiB non-Vercel cap and rejects files above the exact boundary', () => {
    const limit = 100 * 1024 * 1024;
    expect(getMaxVideoUploadBytes()).toBe(limit);
    expect(validateVideoUpload('training.webm', 'video/webm', Buffer.concat([webm, Buffer.alloc(limit - webm.length)]))).toEqual({
      contentType: 'video/webm',
      extension: 'webm',
    });
    expect(validateVideoUpload('training.webm', 'video/webm', Buffer.alloc(limit + 1))).toBeNull();
  });

  it.each([
    ['training.mp4', 'video/webm', mp4],
    ['training.webm', 'video/mp4', webm],
    ['training.exe', 'video/mp4', mp4],
    ['training.mp4', 'video/mp4', Buffer.from('not a video')],
  ])('rejects extension, MIME, or signature mismatch for %s', (filename, mime, bytes) => {
    expect(validateVideoUpload(filename, mime, bytes)).toBeNull();
  });

  it('stores videos under generated names and reads their bytes by stable upload URL', async () => {
    const url = await saveUploadedVideo('video/mp4', mp4);

    expect(url).toMatch(/^\/uploads\/[0-9a-f-]+\.mp4$/i);
    expect(await readVideoFile(url)).toEqual({
      contentType: 'video/mp4',
      data: mp4,
      size: mp4.byteLength,
    });
    expect(await readFile(path.join(directory, url.split('/').at(-1)!))).toEqual(mp4);
  });

  it('parses only single satisfiable byte ranges, including suffix ranges', () => {
    expect(parseByteRange('bytes=2-5', 10)).toEqual({ start: 2, end: 5 });
    expect(parseByteRange('bytes=7-', 10)).toEqual({ start: 7, end: 9 });
    expect(parseByteRange('bytes=-3', 10)).toEqual({ start: 7, end: 9 });
    expect(parseByteRange('bytes=10-11', 10)).toBe('invalid');
    expect(parseByteRange('bytes=0-1,4-5', 10)).toBe('invalid');
    expect(parseByteRange('items=0-1', 10)).toBe('invalid');
    expect(parseByteRange(undefined, 10)).toBeNull();
  });

  it('returns only the requested bytes while retaining the complete object length', async () => {
    const bytes = Buffer.concat([mp4, Buffer.from('more video data')]);
    const url = await saveUploadedVideo('video/mp4', bytes);

    await expect(readVideoFile(url, { start: 2, end: 7 })).resolves.toEqual({
      contentType: 'video/mp4',
      data: bytes.subarray(2, 8),
      size: bytes.byteLength,
    });
  });

  it('fails closed instead of selecting ephemeral disk on an unconfigured production host', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('UPLOADS_DIR', '');

    await expect(saveUploadedVideo('video/mp4', mp4)).rejects.toThrow('DURABLE_UPLOADS_DIR_REQUIRED');
  });

  it('retains a replaced asset while any product, article, or branding row references it', async () => {
    const url = await saveUploadedVideo('video/mp4', mp4);
    const findArticle = vi.fn().mockResolvedValue(null);
    const findProduct = vi.fn().mockResolvedValue({ id: 'product-1' });
    const findBranding = vi.fn().mockResolvedValue(null);
    const store = {
      newsArticle: { findFirst: findArticle },
      shopProduct: { findFirst: findProduct },
      siteBranding: { findFirst: findBranding },
    } as never;

    await deleteUnreferencedMedia(store, url);

    await expect(readVideoFile(url)).resolves.not.toBeNull();
  });

  it('removes a replaced asset only after all reference queries are clear', async () => {
    const url = await saveUploadedVideo('video/mp4', mp4);
    const findFirst = vi.fn().mockResolvedValue(null);
    const store = {
      newsArticle: { findFirst },
      shopProduct: { findFirst },
      siteBranding: { findFirst },
    } as never;

    await deleteUnreferencedMedia(store, url);

    await expect(readVideoFile(url)).resolves.toBeNull();
  });

  it('accepts only canonical HTTPS Aparat watch or embed paths and constructs its own embed URL', () => {
    expect(parseAparatVideoUrl('https://www.aparat.com/v/abc123')).toBe('abc123');
    expect(parseAparatVideoUrl('https://www.aparat.com/video/video/embed/videohash/abc123')).toBe('abc123');
    expect(getAparatEmbedUrl('https://www.aparat.com/v/abc123')).toBe(
      'https://www.aparat.com/video/video/embed/videohash/abc123',
    );
    expect(parseAparatVideoUrl('http://www.aparat.com/v/abc123')).toBeNull();
    expect(parseAparatVideoUrl('https://aparat.com/v/abc123')).toBeNull();
    expect(parseAparatVideoUrl('https://www.aparat.com.evil.example/v/abc123')).toBeNull();
    expect(parseAparatVideoUrl('https://www.aparat.com/v/abc123?autoplay=1')).toBeNull();
    expect(parseAparatVideoUrl('https://www.aparat.com/v/abc123/extra')).toBeNull();
  });
});
