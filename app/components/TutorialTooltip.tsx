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

  const getTooltipPosition = () => {
    const tooltipWidth = SCREEN_WIDTH - 32; 
    const padding = 16;

    // Позиционируем подсказку под целевым элементом
    const top = position.y + position.height + 16; // под элементом
    const left = padding;

    return { top, left, width: tooltipWidth };
  };

  const tooltipStyle = getTooltipPosition();

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
              top: tooltipStyle.top,
              left: tooltipStyle.left,
              width: tooltipStyle.width,
            },
            { opacity: fadeAnim },
          ]}
        >
          <View className="bg-white rounded-2xl px-4 py-4 shadow-lg">
            <Text className="text-[#1C1C1E] text-base font-['SFProDisplayRegular'] leading-6">
              {text}
            </Text>
            
            {/* Стрелка вверх в правом верхнем углу */}
            <View 
              style={{
                position: 'absolute',
                top: -12,
                right: 40,
                width: 0,
                height: 0,
                borderLeftWidth: 12,
                borderRightWidth: 12,
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