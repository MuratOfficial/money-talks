import { useEffect, useRef, useState } from 'react';
import type { View } from 'react-native';
import type { TargetRect } from '@/app/components/FinGuidePointer';

/**
 * Для пустого экрана: измеряет кнопку «Подсказки» и включает ФинГида,
 * который на неё указывает. Координаты берутся из measureInWindow — в той же
 * системе рисуется полноэкранный Modal указателя.
 */
export function useHintPointer(shouldShow: boolean, delay = 600) {
  const targetRef = useRef<View>(null);
  const [target, setTarget] = useState<TargetRect | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!shouldShow) {
      setVisible(false);
      return;
    }
    // Ждём, пока экран доанимирует появление, иначе координаты будут неточными.
    const timer = setTimeout(() => {
      targetRef.current?.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          setTarget({ x, y, width, height });
          setVisible(true);
        }
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [shouldShow, delay]);

  return { targetRef, target, visible, hide: () => setVisible(false) };
}
