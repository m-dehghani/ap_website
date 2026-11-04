import {
  getZarinpalConfig,
  requestPayment as requestZarinpalPayment,
  verifyPayment as verifyZarinpalPayment,
  type ZarinpalConfig,
} from '@/lib/zarinpal';
import type { PaymentGateway } from './types';

export function createZarinpalAdapter(
  config: ZarinpalConfig,
): PaymentGateway {
  return {
    provider: 'ZARINPAL',
    siteUrl: config.siteUrl,
    async requestPayment(amountInRial, description, callbackUrl) {
      const result = await requestZarinpalPayment(
        config,
        amountInRial,
        description,
        callbackUrl,
      );
      return {
        reference: result.authority,
        paymentUrl: result.paymentUrl,
      };
    },
    async verifyPayment(reference, expectedAmountInRial) {
      const result = await verifyZarinpalPayment(
        config,
        reference,
        expectedAmountInRial,
      );
      if (result?.code === -21) return { state: 'not-paid' };
      if (result?.code !== 100 && result?.code !== 101) {
        throw new Error('Zarinpal could not verify the payment');
      }
      const verificationReference =
        typeof result.ref_id === 'number' && Number.isSafeInteger(result.ref_id)
          ? String(result.ref_id)
          : reference;
      return { state: 'paid', reference: verificationReference };
    },
  };
}

export function buildZarinpalAdapter(merchantId: string) {
  const config = getZarinpalConfig(merchantId);
  return config ? createZarinpalAdapter(config) : null;
}
