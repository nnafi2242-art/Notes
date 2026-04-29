import CryptoJS from 'crypto-js';

const FALLBACK_KEY = 'droidnotes-default-key-12345';

/**
 * Basic encryption utility using AES.
 * In a real Android app, this would use the Keystore.
 * For this web-based version, we use a master key provided by the user (or a fallback).
 */
export const CryptoService = {
  encrypt: (text: string, secretKey: string = FALLBACK_KEY): string => {
    try {
      if (!text) return '';
      return CryptoJS.AES.encrypt(text, secretKey).toString();
    } catch (e) {
      console.error('Encryption error:', e);
      return '';
    }
  },

  decrypt: (ciphertext: string, secretKey: string = FALLBACK_KEY): string => {
    try {
      if (!ciphertext) return '';
      const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error('Decryption error:', e);
      return '';
    }
  },

  hashPin: (pin: string): string => {
    return CryptoJS.SHA256(pin).toString();
  }
};
