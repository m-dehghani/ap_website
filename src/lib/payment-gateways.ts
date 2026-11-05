import type { PrismaClient } from '../../prisma/generated/client';
import {
  decryptPaymentCredential,
  isPaymentConfigEncryptionKeyReady,
} from '@/lib/payment-config-crypto';
import { getPaymentSiteUrl } from '@/lib/zarinpal';
import { buildZarinpalAdapter } from '@/lib/payment-providers/zarinpal-adapter';
import { createZibalAdapter } from '@/lib/payment-providers/zibal-adapter';
import type { PaymentGateway, PaymentProviderId } from '@/lib/payment-providers/types';

type GatewayConfigRow = {
  provider: string;
  enabled: boolean;
  isDefault: boolean;
  encryptedCredential: string | null;
};

type GatewayConfigDb = Pick<PrismaClient, 'paymentGatewayConfig'>;

export interface AdminGatewayProvider {
  provider: 'ZARINPAL' | 'ZIBAL' | 'PASARGAD';
  enabled: boolean;
  configured: boolean;
  isDefault: boolean;
  state: 'available' | 'configurable' | 'deferred';
  credentialSource: 'stored' | 'environment' | 'none';
}

export interface AdminGatewaySettings {
  keyReady: boolean;
  defaultProvider: PaymentProviderId | null;
  providers: AdminGatewayProvider[];
}

function hasEnvironmentZarinpalConfig(): boolean {
  return Boolean(
    process.env.ZARINPAL_MERCHANT_ID && getPaymentSiteUrl(),
  );
}

function getDefaultProvider(
  rows: GatewayConfigRow[],
): PaymentProviderId | null {
  const configuredDefault = rows.find(
    (row) =>
      row.isDefault &&
      row.enabled &&
      (row.provider === 'ZARINPAL' || row.provider === 'ZIBAL') &&
      Boolean(row.encryptedCredential),
  );
  if (configuredDefault) {
    return configuredDefault.provider as PaymentProviderId;
  }

  const zarinpalRow = rows.find((row) => row.provider === 'ZARINPAL');
  if (!zarinpalRow && hasEnvironmentZarinpalConfig()) return 'ZARINPAL';
  if (
    zarinpalRow?.enabled &&
    Boolean(zarinpalRow.encryptedCredential) &&
    !rows.some((row) => row.isDefault)
  ) {
    return 'ZARINPAL';
  }
  return null;
}

export async function getAdminGatewaySettings(
  db: GatewayConfigDb,
): Promise<AdminGatewaySettings> {
  const rows = (await db.paymentGatewayConfig.findMany({
    select: {
      provider: true,
      enabled: true,
      isDefault: true,
      encryptedCredential: true,
    },
  })) as GatewayConfigRow[];
  const keyReady = isPaymentConfigEncryptionKeyReady();
  const defaultProvider = keyReady ? getDefaultProvider(rows) : null;

  const providers: AdminGatewayProvider[] = (
    ['ZARINPAL', 'ZIBAL'] as const
  ).map((provider) => {
    const row = rows.find((candidate) => candidate.provider === provider);
    const environmentFallback =
      !row &&
      provider === 'ZARINPAL' &&
      hasEnvironmentZarinpalConfig();
    const configured = Boolean(row?.encryptedCredential) || environmentFallback;
    return {
      provider,
      enabled: keyReady && (row ? row.enabled : environmentFallback),
      configured,
      isDefault: defaultProvider === provider,
      state: provider === 'ZARINPAL' ? 'available' : 'configurable',
      credentialSource: row?.encryptedCredential
        ? 'stored'
        : environmentFallback
          ? 'environment'
          : 'none',
    };
  });
  providers.push({
    provider: 'PASARGAD',
    enabled: false,
    configured: false,
    isDefault: false,
    state: 'deferred',
    credentialSource: 'none',
  });

  return { keyReady, defaultProvider, providers };
}

export async function getPaymentGateway(
  db: GatewayConfigDb,
  provider: PaymentProviderId,
  options: { allowDisabled?: boolean } = {},
): Promise<PaymentGateway | null> {
  if (!isPaymentConfigEncryptionKeyReady()) {
    throw new Error('Payment gateway encryption key is unavailable');
  }

  const row = (await db.paymentGatewayConfig.findUnique({
    where: { provider },
    select: {
      provider: true,
      enabled: true,
      isDefault: true,
      encryptedCredential: true,
    },
  })) as GatewayConfigRow | null;
  if (row && !row.enabled && !options.allowDisabled) return null;

  const credential = row?.encryptedCredential
    ? decryptPaymentCredential(row.encryptedCredential)
    : !row && provider === 'ZARINPAL'
      ? process.env.ZARINPAL_MERCHANT_ID
      : undefined;
  if (!credential) return null;

  if (provider === 'ZARINPAL') {
    return buildZarinpalAdapter(credential);
  }
  const siteUrl = getPaymentSiteUrl();
  if (!siteUrl) return null;
  return createZibalAdapter({ merchant: credential }, siteUrl);
}

export async function getDefaultPaymentGateway(
  db: GatewayConfigDb,
): Promise<PaymentGateway | null> {
  if (!isPaymentConfigEncryptionKeyReady()) {
    throw new Error('Payment gateway encryption key is unavailable');
  }

  const rows = (await db.paymentGatewayConfig.findMany({
    select: {
      provider: true,
      enabled: true,
      isDefault: true,
      encryptedCredential: true,
    },
  })) as GatewayConfigRow[];
  const provider = getDefaultProvider(rows);
  return provider ? getPaymentGateway(db, provider) : null;
}
