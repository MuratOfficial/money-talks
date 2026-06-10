import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { AES, Hex, Base64, Utf8, CipherParams } from 'crypto-es';

/**
 * Шифрованное локальное хранилище для persist-слоя стора.
 *
 * Зачем: финансовые данные пользователя не должны лежать в AsyncStorage
 * открытым текстом. Здесь данные шифруются AES-CBC (pure-JS, crypto-es) на
 * 256-битном ключе, который хранится в защищённом хранилище ОС (Keychain/
 * Keystore) через expo-secure-store. Сам зашифрованный блоб лежит в AsyncStorage.
 *
 * Формат значения в AsyncStorage: `enc:v1:<ivBase64>:<ciphertextBase64>`.
 * Значения без этого префикса считаются легаси-открытым текстом и при первом
 * чтении возвращаются как есть, а при следующей записи шифруются (миграция).
 *
 * Web: expo-secure-store недоступен, поэтому на вебе используется обычный
 * AsyncStorage без шифрования (веб — не целевая платформа приложения).
 */

const SECURE_KEY_NAME = 'mt-storage-enc-key-v1';
const ENC_PREFIX = 'enc:v1:';
const isWeb = Platform.OS === 'web';

let cachedKeyHex: string | null = null;

/** Uint8Array → hex-строка. */
function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/** Достаёт (или создаёт при первом запуске) 256-битный ключ из SecureStore. */
async function getKeyHex(): Promise<string> {
  if (cachedKeyHex) return cachedKeyHex;

  const existing = await SecureStore.getItemAsync(SECURE_KEY_NAME);
  if (existing) {
    cachedKeyHex = existing;
    return existing;
  }

  // Криптографически стойкий ключ из системного ГСЧ.
  const keyHex = bytesToHex(Crypto.getRandomBytes(32));
  await SecureStore.setItemAsync(SECURE_KEY_NAME, keyHex);
  cachedKeyHex = keyHex;
  return keyHex;
}

function encrypt(plaintext: string, keyHex: string): string {
  const key = Hex.parse(keyHex);
  const ivHex = bytesToHex(Crypto.getRandomBytes(16));
  const iv = Hex.parse(ivHex);

  const encrypted = AES.encrypt(plaintext, key, { iv });
  const ctBase64 = encrypted.ciphertext!.toString(Base64);
  const ivBase64 = iv.toString(Base64);

  return `${ENC_PREFIX}${ivBase64}:${ctBase64}`;
}

function decrypt(stored: string, keyHex: string): string | null {
  try {
    const rest = stored.slice(ENC_PREFIX.length);
    const sep = rest.indexOf(':');
    if (sep < 0) return null;

    const ivBase64 = rest.slice(0, sep);
    const ctBase64 = rest.slice(sep + 1);

    const key = Hex.parse(keyHex);
    const iv = Base64.parse(ivBase64);
    const cipherParams = CipherParams.create({
      ciphertext: Base64.parse(ctBase64),
    });

    const decrypted = AES.decrypt(cipherParams, key, { iv });
    const text = decrypted.toString(Utf8);
    return text || null;
  } catch {
    return null;
  }
}

export const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const raw = await AsyncStorage.getItem(name);
      if (raw == null) return null;
      if (isWeb) return raw;

      // Легаси-данные без шифрования — возвращаем как есть (миграция при записи).
      if (!raw.startsWith(ENC_PREFIX)) return raw;

      const keyHex = await getKeyHex();
      return decrypt(raw, keyHex);
    } catch (error) {
      console.error('secureStorage.getItem error:', error);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(name, value);
        return;
      }
      const keyHex = await getKeyHex();
      await AsyncStorage.setItem(name, encrypt(value, keyHex));
    } catch (error) {
      console.error('secureStorage.setItem error:', error);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error('secureStorage.removeItem error:', error);
    }
  },
};
