import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

// expo-local-authentication недоступен в Expo Go без dev-build — грузим защищённо.
let LocalAuthentication: typeof import('expo-local-authentication') | null = null;
try {
  if (Platform.OS !== 'web') {
    LocalAuthentication = require('expo-local-authentication');
  }
} catch {
  LocalAuthentication = null;
}

export interface BiometricInfo {
  /** Аппаратная поддержка + есть хотя бы один зарегистрированный отпечаток/лицо. */
  isAvailable: boolean;
  /** Человекочитаемое название: «Face ID», «Touch ID» или «Биометрия». */
  label: string;
}

/**
 * Хук работы с биометрией (Face ID / Touch ID / отпечаток).
 * Инкапсулирует проверку оборудования и сам вызов аутентификации,
 * чтобы UI не зависел от наличия нативного модуля.
 */
export const useBiometric = () => {
  const [info, setInfo] = useState<BiometricInfo>({ isAvailable: false, label: 'Биометрия' });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const result = await getBiometricInfo();
      if (mounted) setInfo(result);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Запросить биометрическую аутентификацию.
   * @returns true — успешно, false — отказ/ошибка/недоступно.
   */
  const authenticate = async (
    promptMessage = 'Подтвердите вход'
  ): Promise<boolean> => {
    if (!LocalAuthentication) return false;
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Отмена',
        disableDeviceFallback: false, // разрешаем PIN/пароль как запасной вариант
      });
      return result.success;
    } catch (e) {
      console.warn('Biometric auth error:', e);
      return false;
    }
  };

  return { ...info, authenticate };
};

/** Разовая проверка доступности биометрии (вне React-компонента). */
export const getBiometricInfo = async (): Promise<BiometricInfo> => {
  if (!LocalAuthentication) return { isAvailable: false, label: 'Биометрия' };
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    let label = 'Биометрия';
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      label = Platform.OS === 'ios' ? 'Face ID' : 'Face Unlock';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      label = Platform.OS === 'ios' ? 'Touch ID' : 'Отпечаток пальца';
    }

    return { isAvailable: hasHardware && isEnrolled, label };
  } catch (e) {
    console.warn('getBiometricInfo error:', e);
    return { isAvailable: false, label: 'Биометрия' };
  }
};

export default useBiometric;
