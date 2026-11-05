export type RecaptchaVerification =
  | { ok: true }
  | { ok: false; reason: 'invalid' | 'unavailable' };

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const VERIFY_TIMEOUT_MS = 5_000;

export async function verifyRecaptcha(
  token: string,
): Promise<RecaptchaVerification> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || !token) return { ok: false, reason: 'unavailable' };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);
  try {
    const body = new URLSearchParams({ secret, response: token });
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    });
    if (!response.ok) return { ok: false, reason: 'unavailable' };

    let result: unknown;
    try {
      result = await response.json();
    } catch {
      return { ok: false, reason: 'invalid' };
    }

    return typeof result === 'object' &&
      result !== null &&
      'success' in result &&
      result.success === true
      ? { ok: true }
      : { ok: false, reason: 'invalid' };
  } catch {
    return { ok: false, reason: 'unavailable' };
  } finally {
    clearTimeout(timeout);
  }
}
