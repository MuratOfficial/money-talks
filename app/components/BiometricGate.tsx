import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';
import { useBiometric } from '@/hooks/useBiometric';
import { Opacity } from '@/constants/design';

/**
 * Биометрический замок приложения.
 * Если в настройках включён вход по биометрии (biometricEnabled), при запуске и
 * при возврате приложения из фона контент закрывается оверлеем до успешной
 * аутентификации (Face ID / Touch ID / отпечаток).
 */
const BiometricGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, biometricEnabled } = useFinancialStore();
  const { isAvailable, label, authenticate } = useBiometric();

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';

  // Заблокировано, если биометрия включена и доступна.
  const shouldLock = biometricEnabled && isAvailable;
  const [locked, setLocked] = useState(shouldLock);
  const [authing, setAuthing] = useState(false);
  const appState = useRef(AppState.currentState);

  const runAuth = async () => {
    if (authing) return;
    setAuthing(true);
    const ok = await authenticate('Разблокируйте приложение');
    setAuthing(false);
    if (ok) setLocked(false);
  };

  // При первом монтировании — если нужно, блокируем и сразу запрашиваем биометрию.
  useEffect(() => {
    if (shouldLock) {
      setLocked(true);
      runAuth();
    } else {
      setLocked(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLock]);

  // При возврате из фона — снова блокируем и запрашиваем биометрию.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      const prev = appState.current;
      appState.current = next;
      if (prev.match(/inactive|background/) && next === 'active' && shouldLock) {
        setLocked(true);
        runAuth();
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLock]);

  return (
    <View style={{ flex: 1 }}>
      {children}

      {locked && (
        <View className={`absolute inset-0 ${bgColor} items-center justify-center px-8`} style={{ zIndex: 1000 }}>
          <View className="w-24 h-24 rounded-3xl bg-[#4CAF50]/15 items-center justify-center mb-6">
            <MaterialIcons name="lock" size={44} color="#4CAF50" />
          </View>
          <Text className={`${textColor} text-xl font-['SFProDisplaySemiBold'] mb-2`}>
            Приложение заблокировано
          </Text>
          <Text className={`${textSecondaryColor} text-sm text-center font-['SFProDisplayRegular'] mb-8`}>
            Разблокируйте вход с помощью {label}
          </Text>
          <TouchableOpacity
            onPress={runAuth}
            disabled={authing}
            className="bg-[#4CAF50] px-8 py-4 rounded-2xl flex-row items-center"
            activeOpacity={Opacity.press}
          >
            <MaterialIcons name="face" size={22} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white text-base font-['SFProDisplaySemiBold']">
              {authing ? 'Сканирование…' : `Разблокировать`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default BiometricGate;
