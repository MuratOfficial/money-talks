import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';
import FinGuide, { FinGuideMood } from './FinGuide';

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
 * ФинГид с речевым облаком. Появляется с взмахом руки; после закрытия
 * сворачивается в плавающую кнопку (ТЗ: «плавающая кнопка ФинГида с реакциями»).
 */
const AnimatedAssistant: React.FC<AnimatedAssistantProps> = ({ message, visible, mood = 'happy', action, onClose, onOpen }) => {
  const { theme } = useFinancialStore();
  const isDark = theme === 'dark';

  const bubble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(bubble, { toValue: visible ? 1 : 0, friction: 7, tension: 50, useNativeDriver: true }).start();
  }, [visible, message, bubble]);

  if (!visible && !onOpen) return null;

  const bubbleStyle = {
    opacity: bubble,
    transform: [
      { translateY: bubble.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
      { scale: bubble.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
    ],
  };

  return (
    <View
      style={{ position: 'absolute', bottom: 16, right: 16, left: 16, alignItems: 'flex-end', zIndex: 50 }}
      pointerEvents="box-none"
    >
      <View className="flex-row items-end justify-end w-full" pointerEvents="box-none">
        {visible && (
          <Animated.View
            className={`mr-2 mb-8 p-4 rounded-2xl rounded-br-none shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
            style={[{ maxWidth: '72%' }, bubbleStyle]}
          >
            <Text className="text-[#4CAF50] text-xs mb-1 font-['SFProDisplaySemiBold']">ФинГид</Text>
            <Text className={`${isDark ? 'text-gray-100' : 'text-gray-800'} text-sm font-['SFProDisplayRegular'] leading-5`}>
              {message}
            </Text>

            {action && (
              <TouchableOpacity onPress={action.onPress} activeOpacity={0.7} className="mt-3 bg-[#4CAF50] rounded-xl py-2 px-3 self-start">
                <Text className="text-white text-xs font-['SFProDisplaySemiBold']">{action.label}</Text>
              </TouchableOpacity>
            )}

            {onClose && (
              <TouchableOpacity
                onPress={onClose}
                className={`absolute -top-2 -left-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full p-1 shadow-sm`}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={14} color={isDark ? '#FFF' : '#000'} />
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        <TouchableOpacity activeOpacity={0.8} disabled={visible || !onOpen} onPress={onOpen}>
          {/* key: при каждом новом сообщении персонаж заново машет рукой */}
          <FinGuide key={visible ? message : 'minimized'} size={visible ? 76 : 52} mood={visible ? mood : 'neutral'} wave={visible} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AnimatedAssistant;
