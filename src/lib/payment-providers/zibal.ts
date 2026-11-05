export interface ZibalConfig {
  merchant: string;
}

interface ZibalRequestResponse {
  result?: unknown;
  trackId?: unknown;
}

interface ZibalVerifyResponse {
  result?: unknown;
  status?: unknown;
  amount?: unknown;
  refNumber?: unknown;
}

const ZIBAL_API_URL = 'https://gateway.zibal.ir';

async function postJson<T>(
  path: string,
  body: Record<string, string | number>,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${ZIBAL_API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new Error('Zibal request could not be completed');
  }

  if (!response.ok) {
    throw new Error(`Zibal request failed with HTTP ${response.status}`);
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error('Zibal returned an invalid response');
  }
}

export async function requestZibalPayment(
  config: ZibalConfig,
  amountInRial: number,
  description: string,
  callbackUrl: string,
  orderId: string,
): Promise<{ reference: string; paymentUrl: string }> {
  if (!Number.isSafeInteger(amountInRial) || amountInRial <= 0) {
    throw new Error('Zibal payment amount is invalid');
  }
  const result = await postJson<ZibalRequestResponse>('/v1/request', {
    merchant: config.merchant,
    amount: amountInRial,
    description,
    callbackUrl,
    orderId,
  });
  if (
    result.result !== 100 ||
    typeof result.trackId !== 'number' ||
    !Number.isSafeInteger(result.trackId) ||
    result.trackId <= 0
  ) {
    throw new Error('Zibal rejected the payment request');
  }

  const reference = String(result.trackId);
  return {
    reference,
    paymentUrl: `${ZIBAL_API_URL}/start/${encodeURIComponent(reference)}`,
  };
}

export async function verifyZibalPayment(
  config: ZibalConfig,
  trackId: number,
  expectedAmountInRial: number,
): Promise<{ state: 'paid'; reference: string } | { state: 'not-paid' }> {
  if (
    !Number.isSafeInteger(trackId) ||
    trackId <= 0 ||
    !Number.isSafeInteger(expectedAmountInRial) ||
    expectedAmountInRial <= 0
  ) {
    throw new Error('Zibal verification request is invalid');
  }

  const result = await postJson<ZibalVerifyResponse>('/v1/verify', {
    merchant: config.merchant,
    trackId,
  });

  if (result.result === 202) return { state: 'not-paid' };
  if (result.result !== 100 && result.result !== 201) {
    throw new Error('Zibal could not verify the payment');
  }
  if (result.status !== 1 || result.amount !== expectedAmountInRial) {
    return { state: 'not-paid' };
  }
  if (
    typeof result.refNumber !== 'number' ||
    !Number.isSafeInteger(result.refNumber) ||
    result.refNumber <= 0
  ) {
    throw new Error('Zibal returned an invalid transaction reference');
  }

  return { state: 'paid', reference: String(result.refNumber) };
}
