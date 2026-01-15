import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'funnelsight-dev-key-change-in-production';

/**
 * Token encryption utility for secure storage of OAuth tokens
 */
export class TokenEncryption {
  /**
   * Encrypt a token using AES-256
   */
  static encrypt(token: string): string {
    return CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
  }

  /**
   * Decrypt a token
   */
  static decrypt(encryptedToken: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
