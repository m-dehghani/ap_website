const optimizedRemoteHosts = new Set([
  'images.unsplash.com',
  'res.cloudinary.com',
]);

export function imageOptimizationProps(
  src: string,
): { unoptimized: true } | Record<string, never> {
  if (src.startsWith('/') && !src.startsWith('//')) return {};

  try {
    const url = new URL(src);
    if (url.protocol === 'https:' && optimizedRemoteHosts.has(url.hostname)) {
      return {};
    }
  } catch {
    // Keep malformed or non-HTTP sources on the existing unoptimized path.
  }

  return { unoptimized: true };
}
