import {
  requestZibalPayment,
  verifyZibalPayment,
  type ZibalConfig,
} from '@/lib/payment-providers/zibal';
import type { PaymentGateway } from './types';

export function createZibalAdapter(
  config: ZibalConfig,
  siteUrl: string,
): PaymentGateway {
  return {
    provider: 'ZIBAL',
    siteUrl,
    requestPayment(amountInRial, description, callbackUrl, orderId) {
      return requestZibalPayment(
        config,
        amountInRial,
        description,
        callbackUrl,
        orderId,
      );
    },
    verifyPayment(reference, expectedAmountInRial) {
      const trackId = Number(reference);
      if (!Number.isSafeInteger(trackId) || trackId <= 0) {
        throw new Error('Zibal payment reference is invalid');
      }
      return verifyZibalPayment(config, trackId, expectedAmountInRial);
    },
  };
}
