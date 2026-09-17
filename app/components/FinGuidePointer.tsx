import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Colors } from '@/constants/design';
import FinGuide from './FinGuide';
import FinGuideCard from './FinGuideCard';

export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FinGuidePointerProps {
  visible: boolean;
  /** Координаты кнопки из measureInWindow — Modal рисуется в той же системе. */
  target: TargetRect;
  message: string;
  actionLabel?: string;
  /** Нажатие на подсвеченную кнопку или на действие в карточке. */
  onPressTarget: () => void;
  onClose: () => void;
  autoCloseDuration?: number;
}

const GUIDE_SIZE = 84;
const GUIDE_HEIGHT = (GUIDE_SIZE * 150) / 120;
// Где у персонажа кисть поднятой руки (доли ширины и высоты рисунка).
const HAND_X = 0.86;
const SIDE_PADDING = 16;

/**
 * Подсказка на пустом экране: затемнение, пульсирующее кольцо вокруг кнопки
 * «Подсказки» и ФинГид, который указывает на неё рукой.
 */
const FinGuidePointer: React.FC<FinGuidePointerProps> = ({
  visible,
  target,
  message,
  actionLabel = 'Открыть подсказки',
  onPressTarget,
  onClose,
  autoCloseDuration = 8000,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const appear = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (!visible) {
      setRendered(false);
      return;
    }
    setRendered(true);
    appear.setValue(0);
    Animated.spring(appear, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }).start();

    const ring = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true })
    );
    ring.start();

    const timer = setTimeout(() => hide(onClose), autoCloseDuration);
    return () => {
      ring.stop();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const hide = (after: () => void) => {
    Animated.timing(appear, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setRendered(false);
      after();
    });
  };

  if (!visible && !rendered) return null;

  const centerX = target.x + target.width / 2;
  const centerY = target.y + target.height / 2;
  const ringSize = Math.max(target.width, target.height) + 14;

  // Персонаж стоит под кнопкой так, чтобы кисть оказалась под её центром.
  const guideLeft = Math.min(
    Math.max(centerX - GUIDE_SIZE * HAND_X, SIDE_PADDING),
    screenWidth - GUIDE_SIZE - SIDE_PADDING / 2
  );
  const guideTop = target.y + target.height + 6;
  const guideOnRight = guideLeft + GUIDE_SIZE / 2 > screenWidth / 2;

  const guideStyle = {
    opacity: appear,
    transform: [
      { translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
      { scale: appear.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
    ],
  };
  const cardStyle = {
    opacity: appear.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, 1] }),
    transform: [{ translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  };

  return (
    <Modal visible={rendered} transparent animationType="none" onRequestClose={() => hide(onClose)}>
      <Animated.View style={{ flex: 1, opacity: appear }}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }} onPress={() => hide(onClose)} />

        {/* Пульсирующее кольцо вокруг кнопки */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: centerX - ringSize / 2,
            top: centerY - ringSize / 2,
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: 2,
            borderColor: Colors.primary,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] }) }],
          }}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => hide(onPressTarget)}
          accessibilityLabel="Открыть подсказки"
          style={{
            position: 'absolute',
            left: centerX - ringSize / 2,
            top: centerY - ringSize / 2,
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: 2,
            borderColor: Colors.primary,
            backgroundColor: 'rgba(255,255,255,0.18)',
          }}
        />

        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', left: guideLeft, top: guideTop }, guideStyle]}
        >
          <FinGuide size={GUIDE_SIZE} mood="happy" point={guideOnRight} wave={!guideOnRight} />
        </Animated.View>

        <Animated.View
          style={[
            {
              position: 'absolute',
              top: guideTop + GUIDE_HEIGHT * 0.35,
              left: guideOnRight ? SIDE_PADDING : guideLeft + GUIDE_SIZE,
              right: guideOnRight ? screenWidth - guideLeft : SIDE_PADDING,
            },
            cardStyle,
          ]}
        >
          <FinGuideCard
            message={message}
            showGuide={false}
            action={{ label: actionLabel, onPress: () => hide(onPressTarget) }}
            onClose={() => hide(onClose)}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default FinGuidePointer;
