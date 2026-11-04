export type PaymentProviderId = 'ZARINPAL' | 'ZIBAL';

export type PaymentVerification =
  | { state: 'paid'; reference: string }
  | { state: 'not-paid' };

export interface PaymentGateway {
  provider: PaymentProviderId;
  siteUrl: string;
  requestPayment(
    amountInRial: number,
    description: string,
    callbackUrl: string,
    orderId: string,
  ): Promise<{ reference: string; paymentUrl: string }>;
  verifyPayment(
    reference: string,
    expectedAmountInRial: number,
  ): Promise<PaymentVerification>;
}
