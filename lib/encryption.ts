import * as CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = (process.env.ENCRYPTION_KEY ?? '') as string;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is not set. Cannot start without it.');
}

export function encryptData(data: string): string {
  if (!data) return '';
  try {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  } catch {
    return '';
  }
}

export function decryptData(encryptedData: string): string {
  if (!encryptedData) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
}

export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '********';
  return `${key.slice(0, 4)}****${key.slice(-4)}`;
}