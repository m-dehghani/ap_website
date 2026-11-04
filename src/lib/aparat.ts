import { z } from 'zod';

export function parseAparatVideoUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'www.aparat.com' ||
      url.port ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.href !== value
    ) {
      return null;
    }
    const match =
      /^\/v\/([A-Za-z0-9_-]{1,64})$/.exec(url.pathname) ??
      /^\/video\/video\/embed\/videohash\/([A-Za-z0-9_-]{1,64})$/.exec(url.pathname);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export function getAparatEmbedUrl(value: string): string | null {
  const videoId = parseAparatVideoUrl(value);
  return videoId
    ? `https://www.aparat.com/video/video/embed/videohash/${videoId}`
    : null;
}

export const aparatVideoUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .nullable()
  .optional()
  .refine((value) => !value || parseAparatVideoUrl(value) !== null, {
    message: 'نشانی ویدئوی آپارات معتبر نیست',
  });
