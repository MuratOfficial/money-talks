import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Определение базового URL сервера (админ-панель money-talks-admin).
 *
 * - ПРОДАКШН (release-сборка, !__DEV__): EXPO_PUBLIC_API_BASE_PRODUCTION.
 * - РАЗРАБОТКА/ТЕСТЫ (__DEV__): подключаемся к локальному dev-серверу.
 *
 * Сложность в том, что "localhost" в режиме разработки означает разные адреса:
 *   - iOS-симулятор / Expo web         → localhost действительно ваша машина;
 *   - Android-эмулятор                  → машина разработчика доступна как 10.0.2.2;
 *   - реальный телефон (Expo Go/dev)    → нужен LAN-IP машины (напр. 192.168.0.104).
 *
 * Поэтому в dev мы вычисляем IP машины разработчика автоматически из адреса
 * Expo-сервера (Constants → hostUri), что корректно работает на реальном
 * устройстве. Порт берём из EXPO_PUBLIC_API_BASE_LOCAL (по умолчанию 3000).
 */

const PRODUCTION_URL =
  process.env.EXPO_PUBLIC_API_BASE_PRODUCTION ?? '';

const LOCAL_URL =
  process.env.EXPO_PUBLIC_API_BASE_LOCAL ?? 'http://localhost:3000';

/** Достаём порт из EXPO_PUBLIC_API_BASE_LOCAL (fallback 3000). */
function getLocalPort(): string {
  try {
    const url = new URL(LOCAL_URL);
    return url.port || '3000';
  } catch {
    return '3000';
  }
}

/** Хост машины разработчика из адреса Expo-сервера (напр. "192.168.0.104:8081" → "192.168.0.104"). */
function getDevHost(): string | null {
  // Поддерживаем оба источника: expoConfig.hostUri (dev build) и expoGoConfig.debuggerHost (Expo Go).
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as unknown as { expoGoConfig?: { debuggerHost?: string } })
      .expoGoConfig?.debuggerHost ??
    null;

  if (!hostUri) return null;
  // Отрезаем порт Metro-сервера, оставляем только хост/IP.
  return hostUri.split(':')[0] || null;
}

function resolveDevBaseUrl(): string {
  const port = getLocalPort();
  const host = getDevHost();

  // На вебе (Expo web) запросы идут из браузера на той же машине — localhost корректен.
  if (Platform.OS === 'web') {
    return LOCAL_URL;
  }

  if (host) {
    // Android-эмулятор не видит localhost/127.0.0.1 хоста — используем спец-алиас 10.0.2.2.
    if (
      Platform.OS === 'android' &&
      (host === 'localhost' || host === '127.0.0.1')
    ) {
      return `http://10.0.2.2:${port}`;
    }
    return `http://${host}:${port}`;
  }

  // Запасной вариант, если адрес Expo-сервера определить не удалось.
  if (Platform.OS === 'android' && LOCAL_URL.includes('localhost')) {
    return `http://10.0.2.2:${port}`;
  }
  return LOCAL_URL;
}

export const API_BASE_URL: string = __DEV__
  ? resolveDevBaseUrl()
  : PRODUCTION_URL;

if (__DEV__) {
  // Помогает быстро понять, к какому серверу реально подключается приложение.
  console.log('[API] Base URL:', API_BASE_URL);
}
