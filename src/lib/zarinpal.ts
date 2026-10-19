const productionApi = 'https://payment.zarinpal.com/pg/v4/payment';
const sandboxApi = 'https://sandbox.zarinpal.com/pg/v4/payment';

export interface ZarinpalConfig {
  merchantId: string;
  apiUrl: string;
  startPayUrl: string;
  siteUrl: string;
}

interface ZarinpalResponse {
  data?: {
    code?: number;
    authority?: string;
    ref_id?: number;
  };
  errors?: unknown;
}

export function getZarinpalConfig(): ZarinpalConfig | null {
  const merchantId = process.env.ZARINPAL_MERCHANT_ID;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!merchantId || !siteUrl) return null;
  let baseUrl: URL;
  try {
    baseUrl = new URL(siteUrl);
  } catch {
    return null;
  }
  if (
    !['http:', 'https:'].includes(baseUrl.protocol) ||
    (process.env.NODE_ENV === 'production' && baseUrl.protocol !== 'https:') ||
    baseUrl.username ||
    baseUrl.password
  ) {
    return null;
  }

  const sandbox = process.env.ZARINPAL_SANDBOX === 'true';
  return {
    merchantId,
    apiUrl: sandbox ? sandboxApi : productionApi,
    startPayUrl: sandbox
      ? 'https://sandbox.zarinpal.com/pg/StartPay'
      : 'https://payment.zarinpal.com/pg/StartPay',
    siteUrl: baseUrl.origin,
  };
}

async function requestZarinpal(
  url: string,
  body: Record<string, string | number>,
): Promise<ZarinpalResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const result = (await response.json()) as ZarinpalResponse;
  if (!response.ok) {
    throw new Error(`Zarinpal request failed with HTTP ${response.status}`);
  }
  return result;
}

export async function requestPayment(
  config: ZarinpalConfig,
  amount: number,
  description: string,
  callbackUrl: string,
) {
  const result = await requestZarinpal(`${config.apiUrl}/request.json`, {
    merchant_id: config.merchantId,
    amount,
    description,
    callback_url: callbackUrl,
  });
  if (result.data?.code !== 100 || !result.data.authority) {
    throw new Error(
      `Zarinpal payment request was rejected: ${JSON.stringify(result.errors ?? result.data)}`,
    );
  }
  return {
    authority: result.data.authority,
    paymentUrl: `${config.startPayUrl}/${encodeURIComponent(result.data.authority)}`,
  };
}

export async function verifyPayment(
  config: ZarinpalConfig,
  authority: string,
  amount: number,
) {
  const result = await requestZarinpal(`${config.apiUrl}/verify.json`, {
    merchant_id: config.merchantId,
    authority,
    amount,
  });
  return result.data;
}
