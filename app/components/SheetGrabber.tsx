import React, { useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

import useFinancialStore from '@/hooks/useStore';
import { sheetDragOffset, shouldCloseSheet } from '@/utils/sheetDrag';

interface SheetGrabberProps {
  /** Значение, которое сдвигает лист по вертикали (0 — шторка открыта). */
  translateY: Animated.Value;
  /** Закрыть шторку: дальше её доанимирует обычный эффект по `visible`. */
  onClose: () => void;
  /** Содержимое шапки — оно тоже становится зоной для свайпа. */
  children?: React.ReactNode;
}

/** Высота зоны с полоской-ручкой. */
const GRAB_HEIGHT = 40;

/**
 * Ручка шторки: свайп вниз по ней и по шапке закрывает лист, нажатие по самой
 * полоске — тоже (она выглядит как кнопка, и люди по ней жмут).
 *
 * Жест — нативный, из react-native-gesture-handler. До этого здесь был
 * PanResponder: он работал в браузере, но на Android не срабатывал вовсе.
 * GestureHandlerRootView обязателен: внутри Modal на Android жесты без него
 * не доходят до обработчиков, потому что окно модалки — отдельное.
 */
const SheetGrabber: React.FC<SheetGrabberProps> = ({ translateY, onClose, children }) => {
  const { theme } = useFinancialStore();
  const isDark = theme === 'dark';

  const settle = () =>
    Animated.spring(translateY, {
      toValue: 0,
      bounciness: 0,
      // Тот же драйвер, что у открытия и закрытия листа.
      useNativeDriver: true,
    }).start();

  const gesture = useMemo(() => {
    // Нажатие обрабатываем тем же жестом, а не отдельной кнопкой: кнопка
    // внутри GestureDetector получает нажатие не на всех платформах.
    const tap = Gesture.Tap()
      .runOnJS(true)
      .maxDuration(400)
      .onEnd((event, success) => {
        // Только по самой ручке: нажатия по заголовку и кнопкам в шапке
        // закрывать шторку не должны.
        if (success && event.y <= GRAB_HEIGHT) onClose();
      });

    const pan = Gesture.Pan()
      // Колбэки на JS-потоке: двигаем обычное Animated.Value, ворклеты не нужны.
      .runOnJS(true)
      // Жест начинается только от заметного движения вниз, чтобы не мешать
      // нажатиям на кнопки в шапке.
      .activeOffsetY(8)
      .failOffsetX([-24, 24])
      .onUpdate((event) => {
        translateY.setValue(sheetDragOffset(event.translationY));
      })
      .onEnd((event) => {
        // velocityY приходит в px/с, а порог задан в px/мс.
        if (shouldCloseSheet(event.translationY, event.velocityY / 1000)) {
          onClose();
          return;
        }
        settle();
      })
      .onTouchesCancelled(() => settle());

    // Пока тянут — тап не должен срабатывать, поэтому Pan главнее.
    return Gesture.Exclusive(pan, tap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translateY, onClose]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <GestureDetector gesture={gesture}>
        <View collapsable={false}>
          <View
            style={styles.grab}
            accessibilityRole="button"
            accessibilityLabel="Закрыть"
          >
            <View
              style={[
                styles.bar,
                { backgroundColor: isDark ? '#4B5563' : '#9CA3AF' },
              ]}
            />
          </View>
          {children}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  // Корень жестов не должен растягиваться на всю шторку — только на шапку.
  root: { flexGrow: 0, flexShrink: 0 },
  grab: {
    height: GRAB_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    width: 48,
    height: 5,
    borderRadius: 3,
  },
});

export default SheetGrabber;
