import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Высота полосы. Специально маленькая — индикатор не должен привлекать внимание. */
const BAR_HEIGHT = 2;
/** Ширина бегунка относительно экрана. */
const RUNNER_WIDTH = SCREEN_WIDTH * 0.35;
/** Сколько держим индикатор после завершения, чтобы он не мигал на быстрых синхронизациях. */
const FADE_OUT_MS = 250;

interface Props {
  /** Идёт ли синхронизация прямо сейчас. */
  active: boolean;
}

/**
 * Тонкая полоса под статус-баром, показывающая фоновую синхронизацию.
 *
 * Пришла на замену баннеру с текстом «Синхронизация данных…»: тот появлялся
 * при каждой отправке данных и перекрывал часть экрана. Синхронизация —
 * фоновый процесс, пользователю от него ничего не требуется, поэтому и
 * сообщать о нём нужно молча. Ошибки и офлайн по-прежнему показываются
 * баннером — там реакция пользователя как раз может понадобиться.
 */
export const SyncActivityIndicator: React.FC<Props> = ({ active }) => {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  // Держим полосу смонтированной до конца анимации исчезновения.
  const [mounted, setMounted] = useState(active);

  useEffect(() => {
    if (active) {
      setMounted(true);

      const runner = Animated.loop(
        Animated.timing(progress, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      );
      runner.start();

      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();

      return () => {
        runner.stop();
        progress.setValue(0);
      };
    }

    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_OUT_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [active, opacity, progress]);

  if (!mounted) return null;

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-RUNNER_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: insets.top,
        left: 0,
        right: 0,
        height: BAR_HEIGHT,
        overflow: 'hidden',
        zIndex: 1000,
      }}
    >
      <Animated.View
        style={{
          width: RUNNER_WIDTH,
          height: BAR_HEIGHT,
          backgroundColor: '#4CAF50',
          opacity,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
};

export default SyncActivityIndicator;
