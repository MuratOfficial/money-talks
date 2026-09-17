import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, TouchableOpacity } from 'react-native';
import useFinancialStore from '@/hooks/useStore';
import { Opacity } from '@/constants/design';
import FinGuide, { FinGuideMood } from './FinGuide';
import FinGuideCard, { cardPalette } from './FinGuideCard';
import FadeInView from './FadeInView';

interface AnimatedAssistantProps {
  message: string;
  visible: boolean;
  mood?: FinGuideMood;
  /** Кнопка под сообщением, например «Внести доход». */
  action?: { label: string; onPress: () => void };
  onClose?: () => void;
  /** Если задан, после закрытия ФинГид остаётся маленькой кнопкой в углу. */
  onOpen?: () => void;
}

/**
 * ФинГид с подсказкой: карточка выезжает снизу, персонаж машет рукой.
 * После закрытия сворачивается в плавающую кнопку
 * (ТЗ: «плавающая кнопка ФинГида с реакциями»).
 */
const AnimatedAssistant: React.FC<AnimatedAssistantProps> = ({ message, visible, mood = 'happy', action, onClose, onOpen }) => {
  const isDark = useFinancialStore((s) => s.theme) === 'dark';
  const palette = cardPalette(isDark);

  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  // Карточка остаётся в дереве, пока доигрывает анимация скрытия.
  const [cardMounted, setCardMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setCardMounted(true);
      Animated.spring(progress, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true }).start();
    } else {
      Animated.timing(progress, { toValue: 0, duration: 200, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(
        ({ finished }) => finished && setCardMounted(false)
      );
    }
  }, [visible, progress]);

  if (!cardMounted && !onOpen) return null;

  const cardStyle = {
    width: '100%' as const,
    opacity: progress,
    transform: [
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
    ],
  };

  return (
    <View style={{ position: 'absolute', bottom: 16, right: 16, left: 16, alignItems: 'flex-end', zIndex: 50 }} pointerEvents="box-none">
      {cardMounted && (
        <Animated.View style={cardStyle} pointerEvents={visible ? 'auto' : 'none'}>
          {/* key: при каждом новом сообщении персонаж заново машет рукой */}
          <FinGuideCard key={message} message={message} mood={mood} action={action} onClose={onClose} wave />
        </Animated.View>
      )}

      {/* Свёрнутый ФинГид лежит в обычном потоке, а не absolute: на Android
          нажатия по ребёнку за границами родителя до него не доходят. */}
      {onOpen && !cardMounted && (
        <FadeInView offset={10}>
          <TouchableOpacity
            activeOpacity={Opacity.press}
            onPress={onOpen}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Открыть подсказку ФинГида"
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: palette.background,
              borderWidth: 1,
              borderColor: palette.border,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.4 : 0.15,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            {/* Тень на iOS пропадает при overflow: hidden, поэтому обрезаем во внутреннем слое */}
            <View style={{ flex: 1, borderRadius: 30, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' }}>
              <View style={{ marginBottom: -14 }}>
                <FinGuide size={46} mood="neutral" />
              </View>
            </View>
          </TouchableOpacity>
        </FadeInView>
      )}
    </View>
  );
};

export default AnimatedAssistant;
