import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';
import { Motion } from '@/constants/design';

interface FadeInViewProps {
  children: React.ReactNode;
  /** Задержка появления (мс) — для каскадного эффекта в списках. */
  delay?: number;
  /** Длительность анимации (мс). */
  duration?: number;
  /** Смещение снизу вверх при появлении (px). 0 — только fade. */
  offset?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

/**
 * Плавное появление контента (fade + лёгкий подъём) на штатном RN Animated
 * (useNativeDriver) — убирает «резкость» при открытии экранов и карточек.
 * Единый примитив дизайн-системы, см. constants/design.ts.
 */
const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  duration = Motion.duration.base,
  offset = 8,
  style,
  className,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(offset)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
    // Анимируем один раз при монтировании.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      className={className}
      style={[{ opacity, transform: [{ translateY }] }, style]}
    >
      {children}
    </Animated.View>
  );
};

export default FadeInView;
