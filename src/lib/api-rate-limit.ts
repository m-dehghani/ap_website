import type { NextApiRequest, NextApiResponse } from 'next';

const WINDOW_MS = 15 * 60 * 1_000;
const MAX_REQUESTS = 5;
const MAX_CLIENTS = 10_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rejectRateLimitedRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  scope: 'login' | 'register' | 'activation',
): boolean {
  const clientAddress = req.socket?.remoteAddress ?? 'unknown';
  const key = `${scope}:${clientAddress}`;
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    if (!current && buckets.size >= MAX_CLIENTS) {
      const oldestKey = buckets.keys().next().value;
      if (oldestKey !== undefined) buckets.delete(oldestKey);
    }
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (current.count >= MAX_REQUESTS) {
    res.setHeader(
      'Retry-After',
      String(Math.max(1, Math.ceil((current.resetAt - now) / 1_000))),
    );
    res.status(429).json({
      message: 'تعداد درخواست‌ها بیش از حد مجاز است؛ کمی بعد دوباره تلاش کنید',
    });
    return true;
  }

  current.count += 1;
  return false;
}
