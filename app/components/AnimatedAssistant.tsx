import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';

interface AnimatedAssistantProps {
  message: string;
  visible: boolean;
  onClose?: () => void;
}

const AnimatedAssistant: React.FC<AnimatedAssistantProps> = ({ message, visible, onClose }) => {
  const { theme } = useFinancialStore();
  const isDark = theme === 'dark';
  const [isVisible, setIsVisible] = useState(visible);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setIsVisible(visible);
    if (visible) {
      // Появление
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Анимация плавания
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -10,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
        // Исчезновение перед скрытием
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
        }).start(() => {
            // Опционально можно скрыть компонент полностью
        });
    }
  }, [visible]);

  if (!isVisible && !visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 80, 
        right: 16,
        left: 16,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        alignItems: 'flex-end',
        zIndex: 50,
        pointerEvents: 'box-none' 
      }}
    >
      <View className="flex-row items-end justify-end w-full" style={{pointerEvents: 'auto'}}>
        {/* Сообщение */}
        <View 
            className={`mr-3 p-4 rounded-2xl rounded-br-none shadow-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
            style={{ maxWidth: '75%' }}
        >
          <Text className={`${isDark ? 'text-gray-100' : 'text-gray-800'} text-sm font-['SFProDisplayRegular'] leading-5`}>
            {message}
          </Text>
          
          {/* Треугольник для бабла (хвостик) */}
          <View 
            style={{
                position: 'absolute',
                right: -8,
                bottom: 0,
                width: 0,
                height: 0,
                borderTopWidth: 10,
                borderLeftWidth: 10,
                borderRightWidth: 10,
                borderBottomWidth: 0,
                borderStyle: 'solid',
                backgroundColor: 'transparent',
                borderTopColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: isDark ? '#1F2937' : '#FFFFFF', 
            }} 
          />
          
          {onClose && (
            <TouchableOpacity 
                onPress={onClose}
                className={`absolute -top-2 -left-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full p-1 shadow-sm`}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
                <Ionicons name="close" size={14} color={isDark ? '#FFF' : '#000'} />
            </TouchableOpacity>
          )}
        </View>

        {/* Робот-иконка */}
        <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
            <View className={`w-14 h-14 rounded-full items-center justify-center ${isDark ? 'bg-cyan-900' : 'bg-cyan-100'} border-2 ${isDark ? 'border-cyan-700' : 'border-cyan-200'} shadow-sm`}>
                <MaterialCommunityIcons 
                    name="robot-excited-outline" 
                    size={32} 
                    color={isDark ? '#22D3EE' : '#0891B2'} 
                />
            </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

export default AnimatedAssistant;
