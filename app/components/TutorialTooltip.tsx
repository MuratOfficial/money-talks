import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TooltipPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TutorialTooltipProps {
  visible: boolean;
  text: string;
  position: TooltipPosition;
  autoCloseDuration?: number; // в миллисекундах
  onClose?: () => void;
}

const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  visible,
  text,
  position,
  autoCloseDuration = 5000,
  onClose,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Анимация появления
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Автоматическое закрытие
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, autoCloseDuration]);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose?.();
    });
  };

  const PADDING = 16;
  const ARROW_HALF_WIDTH = 12;

  const tooltipWidth = SCREEN_WIDTH - PADDING * 2;
  const tooltipLeft = PADDING;
  // Подсказка встаёт под элементом; координаты приходят из measureInWindow,
  // а Modal рисуется во всё окно — системы координат совпадают.
  const tooltipTop = position.y + position.height + 12;

  // Стрелка указывает на центр цели. Держим её в пределах пузыря, иначе
  // на краю экрана уголок вылезал бы за скруглённый угол.
  const targetCenterX = position.x + position.width / 2;
  const arrowLeft = Math.min(
    Math.max(targetCenterX - tooltipLeft - ARROW_HALF_WIDTH, ARROW_HALF_WIDTH),
    tooltipWidth - ARROW_HALF_WIDTH * 3
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
        <View className="flex-1 bg-black/50">
        <Animated.View 
        className="flex-1"
        style={{ opacity: fadeAnim }}
      >
        {/* Tooltip с подсказкой */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: tooltipTop,
              left: tooltipLeft,
              width: tooltipWidth,
            },
            { opacity: fadeAnim },
          ]}
        >
          <View className="bg-white rounded-2xl px-4 py-4 shadow-lg">
            <Text className="text-[#1C1C1E] text-base font-['SFProDisplayRegular'] leading-6">
              {text}
            </Text>
            
            {/* Стрелка вверх — указывает точно на центр кнопки */}
            <View
              style={{
                position: 'absolute',
                top: -12,
                left: arrowLeft,
                width: 0,
                height: 0,
                borderLeftWidth: ARROW_HALF_WIDTH,
                borderRightWidth: ARROW_HALF_WIDTH,
                borderBottomWidth: 12,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: 'white',
              }}
            />
          </View>
        </Animated.View>
      </Animated.View>
        </View>
      
    </Modal>
  );
};

export default TutorialTooltip;