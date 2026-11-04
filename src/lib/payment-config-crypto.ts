import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const KEY_BYTES = 32;
const IV_BYTES = 12;

function getEncryptionKey(): Buffer {
  const encoded = process.env.PAYMENT_CONFIG_ENCRYPTION_KEY;
  if (!encoded) {
    throw new Error('Payment configuration encryption key is unavailable');
  }

  const key = Buffer.from(encoded, 'base64');
  if (
    key.length !== KEY_BYTES ||
    key.toString('base64').replace(/=+$/, '') !== encoded.replace(/=+$/, '')
  ) {
    throw new Error('Payment configuration encryption key is invalid');
  }
  return key;
}

export function isPaymentConfigEncryptionKeyReady(): boolean {
  try {
    getEncryptionKey();
    return true;
  } catch {
    return false;
  }
}

export function encryptPaymentCredential(credential: string): string {
  if (!credential) {
    throw new Error('Payment credential cannot be empty');
  }

  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(credential, 'utf8'),
    cipher.final(),
  ]);
  return [
    'v1',
    iv.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
    ciphertext.toString('base64url'),
  ].join(':');
}

export function decryptPaymentCredential(envelope: string): string {
  const [version, encodedIv, encodedTag, encodedCiphertext, extra] =
    envelope.split(':');
  if (
    version !== 'v1' ||
    !encodedIv ||
    !encodedTag ||
    !encodedCiphertext ||
    extra !== undefined
  ) {
    throw new Error('Payment credential envelope is invalid');
  }

  const iv = Buffer.from(encodedIv, 'base64url');
  const tag = Buffer.from(encodedTag, 'base64url');
  const ciphertext = Buffer.from(encodedCiphertext, 'base64url');
  if (iv.length !== IV_BYTES || tag.length !== 16 || ciphertext.length === 0) {
    throw new Error('Payment credential envelope is invalid');
  }

  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
}
