import { useMemo, useRef } from 'react';
import { Animated, PanResponder } from 'react-native';

/** Насколько нужно протянуть шторку вниз по умолчанию, чтобы она закрылась. */
export const DEFAULT_CLOSE_DISTANCE = 110;

/** Скорость смахивания, после которой шторка закрывается независимо от пути. */
export const CLOSE_VELOCITY = 0.8;

/** Сдвиг листа за пальцем: вверх шторку не тянем, только вниз. */
export function sheetDragOffset(dy: number): number {
  return Math.max(0, dy);
}

/** Отпустили палец: закрывать шторку или вернуть на место? */
export function shouldCloseSheet(
  dy: number,
  vy: number,
  closeDistance: number = DEFAULT_CLOSE_DISTANCE
): boolean {
  // Либо протянули достаточно далеко, либо резко смахнули вниз.
  return dy > closeDistance || vy > CLOSE_VELOCITY;
}

interface SheetDragOptions {
  /** Значение, которое сдвигает лист по вертикали (0 — шторка открыта). */
  translateY: Animated.Value;
  /** Закрыть шторку: дальше её доанимирует обычный эффект по `visible`. */
  onClose: () => void;
  /** Сколько нужно протянуть вниз, чтобы шторка закрылась. */
  closeDistance?: number;
}

/**
 * Свайп вниз закрывает шторку. Полоску-«ручку» мы рисовали, а жеста не было —
 * люди тянули её и ничего не происходило.
 *
 * Обработчики навешиваются на шапку листа (ручка + заголовок), а не на весь
 * лист: иначе жест конфликтует со скроллом содержимого. PanResponder
 * перехватывает жест только при движении, поэтому кнопки в шапке продолжают
 * нажиматься.
 */
export function useSheetDrag({
  translateY,
  onClose,
  closeDistance = DEFAULT_CLOSE_DISTANCE,
}: SheetDragOptions) {
  // onClose меняется на каждый рендер, а PanResponder создаётся один раз.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const responder = useMemo(() => {
    const settle = () =>
      Animated.spring(translateY, {
        toValue: 0,
        bounciness: 0,
        // Тот же драйвер, что у открытия листа (см. комментарий там).
        useNativeDriver: false,
      }).start();

    return PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) =>
        gesture.dy > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_event, gesture) => {
        translateY.setValue(sheetDragOffset(gesture.dy));
      },
      onPanResponderRelease: (_event, gesture) => {
        if (shouldCloseSheet(gesture.dy, gesture.vy, closeDistance)) {
          onCloseRef.current();
          return;
        }
        settle();
      },
      onPanResponderTerminate: settle,
    });
  }, [translateY, closeDistance]);

  return responder.panHandlers;
}
