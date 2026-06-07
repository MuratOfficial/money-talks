import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  /** Текст ошибки. Если null/пусто — баннер скрыт */
  message: string | null;
  onDismiss: () => void;
  /** Автоскрытие через N мс (0 — не скрывать автоматически) */
  autoHideMs?: number;
}

/**
 * Ненавязчивый баннер вверху экрана для уведомлений об ошибках синхронизации.
 */
export const SyncStatusBanner: React.FC<Props> = ({
  message,
  onDismiss,
  autoHideMs = 4000,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (message) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 6,
      }).start();

      if (autoHideMs > 0) {
        const timer = setTimeout(onDismiss, autoHideMs);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [message, autoHideMs, onDismiss, translateY]);

  if (!message) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: Platform.OS === 'ios' ? 56 : 24,
        left: 16,
        right: 16,
        transform: [{ translateY }],
        zIndex: 1000,
      }}
    >
      <TouchableOpacity
        onPress={onDismiss}
        activeOpacity={0.9}
        className="flex-row items-center bg-red-600 rounded-xl px-4 py-3"
      >
        <Ionicons name="cloud-offline-outline" size={20} color="#fff" />
        <Text className="text-white text-sm font-['SFProDisplayRegular'] flex-1 ml-3">
          {message}
        </Text>
        <Ionicons name="close" size={18} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default SyncStatusBanner;
