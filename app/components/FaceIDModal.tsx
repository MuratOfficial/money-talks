import React, { useEffect, useRef, useState } from 'react';
import { View, Modal, TouchableOpacity, Dimensions, Text, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';
import { useBiometric } from '@/hooks/useBiometric';
import { Motion, Opacity } from '@/constants/design';

interface FaceIDModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: () => void;
  /** Текст приглашения системного диалога биометрии. */
  promptMessage?: string;
}

type Phase = 'scanning' | 'success' | 'error';

const FaceIDModal: React.FC<FaceIDModalProps> = ({
  visible,
  onClose,
  onSuccess,
  onError,
  promptMessage = 'Подтвердите вход',
}) => {
  const { theme } = useFinancialStore();
  const { isAvailable, label, authenticate } = useBiometric();

  const isDark = theme === 'dark';
  const iconBgColor = isDark ? 'bg-gray-800/80' : 'bg-gray-200/80';
  const borderColor = isDark ? 'border-gray-700/50' : 'border-gray-300/50';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';

  const [phase, setPhase] = useState<Phase>('scanning');

  // Анимации: появление фона + «дыхание» иконки во время сканирования.
  const fade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;

    setPhase('scanning');
    Animated.timing(fade, {
      toValue: 1,
      duration: Motion.duration.base,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    // Запускаем реальную биометрическую аутентификацию.
    let cancelled = false;
    (async () => {
      // Если биометрия недоступна — сразу ошибка с понятным сообщением.
      if (!isAvailable) {
        if (!cancelled) {
          setPhase('error');
          pulseLoop.stop();
        }
        return;
      }
      const ok = await authenticate(promptMessage);
      if (cancelled) return;
      pulseLoop.stop();
      if (ok) {
        setPhase('success');
        setTimeout(() => onSuccess?.(), 500);
      } else {
        setPhase('error');
      }
    })();

    return () => {
      cancelled = true;
      pulseLoop.stop();
      fade.setValue(0);
      pulse.setValue(1);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, isAvailable]);

  if (!visible) return null;

  const config = {
    scanning: { icon: 'face' as const, color: '#4CAF50', title: label, subtitle: 'Сканирование…' },
    success: { icon: 'check-circle' as const, color: '#4CAF50', title: 'Успешно', subtitle: 'Доступ разрешён' },
    error: {
      icon: 'error-outline' as const,
      color: '#EF4444',
      title: isAvailable ? 'Не распознано' : 'Биометрия недоступна',
      subtitle: isAvailable
        ? 'Попробуйте ещё раз'
        : 'Включите Face ID / отпечаток в настройках устройства',
    },
  }[phase];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
          opacity: fade,
        }}
        className="bg-black/70"
      >
        {/* Close button */}
        <TouchableOpacity
          onPress={onClose}
          className="absolute z-10 w-10 h-10 bg-black/30 rounded-full items-center justify-center"
          style={{ top: 50, right: 20 }}
          activeOpacity={Opacity.press}
        >
          <MaterialIcons name="close" size={24} color="white" />
        </TouchableOpacity>

        {/* Centered content */}
        <View className="items-center justify-center" style={{ flex: 1 }}>
          <Animated.View
            style={{ transform: [{ scale: phase === 'scanning' ? pulse : 1 }] }}
            className={`w-32 h-32 ${iconBgColor} rounded-3xl items-center justify-center border ${borderColor}`}
          >
            <MaterialIcons name={config.icon} size={52} color={config.color} />
          </Animated.View>

          <Text className={`${textColor} text-lg font-['SFProDisplaySemiBold'] mt-6`}>
            {config.title}
          </Text>
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mt-1 text-center px-10`}>
            {config.subtitle}
          </Text>

          {/* Retry on error (только если биометрия в принципе доступна) */}
          {phase === 'error' && (
            <View className="flex-row mt-8" style={{ gap: 12 }}>
              {isAvailable && (
                <TouchableOpacity
                  onPress={retry}
                  className="bg-[#4CAF50] px-6 py-3 rounded-xl"
                  activeOpacity={Opacity.press}
                >
                  <Text className="text-white font-['SFProDisplaySemiBold']">Повторить</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => { onError?.(); }}
                className="bg-gray-600 px-6 py-3 rounded-xl"
                activeOpacity={Opacity.press}
              >
                <Text className="text-white font-['SFProDisplaySemiBold']">Закрыть</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );

  // Повторная попытка аутентификации.
  async function retry() {
    setPhase('scanning');
    const ok = await authenticate(promptMessage);
    setPhase(ok ? 'success' : 'error');
    if (ok) setTimeout(() => onSuccess?.(), 500);
  }
};

export default FaceIDModal;
