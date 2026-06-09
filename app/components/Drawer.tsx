import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions, ScrollView, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';
import { Motion, Opacity } from '@/constants/design';

interface DrawerProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSelect: (option: string) => void;
  selectedValue?: string;
  options: string[];
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  /** @deprecated анимация теперь всегда кастомная (фон — fade, лист — slide) */
  animationType?: "slide" | "none" | "fade" | undefined;
}

const { height: screenHeight } = Dimensions.get('window');

const Drawer: React.FC<DrawerProps> = ({
  visible,
  onClose,
  onSelect,
  selectedValue = '5 лет',
  options,
  title,
}) => {
  const { theme } = useFinancialStore();
  const [selectedOption, setSelectedOption] = useState(selectedValue);

  // --- Кастомная анимация: фон плавно затемняется (fade), лист выезжает снизу (slide) ---
  const [mounted, setMounted] = useState(visible);
  const anim = useRef(new Animated.Value(0)).current;
  const sheetHeight = useRef(screenHeight);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setSelectedOption(selectedValue); // синхронизируем выбор при каждом открытии
      Animated.timing(anim, {
        toValue: 1,
        duration: Motion.duration.base,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      Animated.timing(anim, {
        toValue: 0,
        duration: Motion.duration.fast,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const sortOptions = options;
  const isDark = theme === 'dark';
  const drawerBgColor = isDark ? 'bg-[#1C1C1E]' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const optionBgColor = isDark ? 'bg-[#333333]' : 'bg-gray-100';
  const handleBarColor = isDark ? 'bg-gray-600' : 'bg-gray-400';
  const iconColor = isDark ? 'white' : '#11181C';
  const borderColor = isDark ? 'border-gray-500' : 'border-gray-400';

  const handleSelect = () => {
    onSelect(selectedOption);
    onClose();
  };

  const RadioOption = ({ option }: { option: string }) => (
    <TouchableOpacity
      onPress={() => setSelectedOption(option)}
      className={`${optionBgColor} rounded-xl px-4 py-4 mb-3 flex-row items-center justify-between`}
      activeOpacity={Opacity.press}
    >
      <Text className={`${textColor} text-base font-['SFProDisplayRegular']`}>
        {option}
      </Text>

      <View className={`w-6 h-6 rounded-full border-2 ${borderColor} items-center justify-center`}>
        {selectedOption === option && (
          <View className="w-3 h-3 rounded-full bg-[#4CAF50]" />
        )}
      </View>
    </TouchableOpacity>
  );

  // Высота для скролла — оставляем место под хедер/кнопку/отступы.
  const maxScrollHeight = screenHeight * 0.6;

  // Фон: прозрачность 0 → 0.5. Лист: смещение снизу вверх на свою высоту → 0.
  const backdropOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetHeight.current, 0],
  });

  return (
    <Modal
      visible={mounted}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop — отдельный слой, только fade (не двигается) */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            opacity: backdropOpacity,
          }}
        >
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
        </Animated.View>

        {/* Лист — отдельный слой, только slide */}
        <Animated.View
          onLayout={(e) => { sheetHeight.current = e.nativeEvent.layout.height || screenHeight; }}
          style={{ transform: [{ translateY }] }}
          className={`${drawerBgColor} rounded-t-3xl px-4 pt-6 pb-4`}
        >
          {/* Handle Bar */}
          <View className={`w-10 h-1 ${handleBarColor} rounded-full self-center mb-6`} />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className={`${textColor} text-lg font-['SFProDisplaySemiBold']`}>
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-1"
              activeOpacity={Opacity.press}
            >
              <Ionicons name="close" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Options — с ограничением высоты и прокруткой */}
          <ScrollView
            style={{ maxHeight: maxScrollHeight }}
            showsVerticalScrollIndicator={true}
            className="mb-4"
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {sortOptions.map((option) => (
              <RadioOption key={option} option={option} />
            ))}
          </ScrollView>

          {/* Select Button */}
          <TouchableOpacity
            onPress={handleSelect}
            activeOpacity={Opacity.press}
            className="w-full bg-[#4CAF50] py-4 rounded-xl items-center justify-center mt-2"
          >
            <Text className="text-white text-base font-['SFProDisplaySemiBold']">
              Выбрать
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default Drawer;
