import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions, ScrollView, Animated, Easing, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';
import { Opacity } from '@/constants/design';

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

  // Анимация шторки (как в Hint/HintWithChat): панель выезжает снизу, затемнение
  // фона жёстко привязано к её позиции — один источник анимации, без рассинхрона.
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const [rendered, setRendered] = useState(visible);

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, screenHeight],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (visible) {
      setRendered(true);
      setSelectedOption(selectedValue); // синхронизируем выбор при каждом открытии
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setRendered(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const sortOptions = options;
  const isDark = theme === 'dark';
  // Фон/паддинги листа задаём инлайн-стилем (className на Animated.View ненадёжен в NativeWind).
  const sheetBg = isDark ? '#1C1C1E' : '#FFFFFF';
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

  return (
    <Modal
      visible={rendered}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop — затемнение привязано к позиции листа */}
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', opacity: backdropOpacity }]}
        >
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
        </Animated.View>

        {/* Лист — выезжает снизу (стили инлайн, как в Hint: className на Animated.View ненадёжен) */}
        <Animated.View
          style={{
            transform: [{ translateY }],
            backgroundColor: sheetBg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 16,
          }}
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
