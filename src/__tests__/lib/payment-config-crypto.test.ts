import { afterEach, describe, expect, it } from 'vitest';
import {
  decryptPaymentCredential,
  encryptPaymentCredential,
  isPaymentConfigEncryptionKeyReady,
} from '@/lib/payment-config-crypto';

const originalKey = process.env.PAYMENT_CONFIG_ENCRYPTION_KEY;

afterEach(() => {
  if (originalKey === undefined) {
    delete process.env.PAYMENT_CONFIG_ENCRYPTION_KEY;
  } else {
    process.env.PAYMENT_CONFIG_ENCRYPTION_KEY = originalKey;
  }
});

describe('payment credential encryption', () => {
  it('encrypts credentials with a fresh authenticated envelope and round-trips them', () => {
    process.env.PAYMENT_CONFIG_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString(
      'base64',
    );

    const first = encryptPaymentCredential('merchant-secret');
    const second = encryptPaymentCredential('merchant-secret');

    expect(first).not.toContain('merchant-secret');
    expect(second).not.toBe(first);
    expect(decryptPaymentCredential(first)).toBe('merchant-secret');
  });

  it('fails closed when the key is absent or not exactly 32 bytes', () => {
    delete process.env.PAYMENT_CONFIG_ENCRYPTION_KEY;
    expect(isPaymentConfigEncryptionKeyReady()).toBe(false);
    expect(() => encryptPaymentCredential('merchant-secret')).toThrow();

    process.env.PAYMENT_CONFIG_ENCRYPTION_KEY = Buffer.alloc(16, 1).toString(
      'base64',
    );
    expect(isPaymentConfigEncryptionKeyReady()).toBe(false);
    expect(() => decryptPaymentCredential('v1:bad:bad:bad')).toThrow();
  });

  it('rejects modified ciphertext instead of returning corrupted credentials', () => {
    process.env.PAYMENT_CONFIG_ENCRYPTION_KEY = Buffer.alloc(32, 3).toString(
      'base64',
    );
    const encrypted = encryptPaymentCredential('merchant-secret');
    const [version, iv, tag, data] = encrypted.split(':');
    const tampered = `${version}:${iv}:${tag}:${data.slice(0, -2)}AA`;

    expect(() => decryptPaymentCredential(tampered)).toThrow();
  });
});
