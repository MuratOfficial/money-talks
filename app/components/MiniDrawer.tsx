import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions, Animated, Easing, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';
import { Opacity } from '@/constants/design';

interface ConfirmationDrawerProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

const { height: screenHeight } = Dimensions.get('window');

const ConfirmationDrawer: React.FC<ConfirmationDrawerProps> = ({
  visible,
  title,
  onClose,
  onConfirm,
  onCancel,
  confirmText = "Да",
  cancelText = "Нет",
  confirmButtonColor = "#4CAF50", // brand green
  cancelButtonColor = "#374151"   // gray-700
}) => {
  const { theme } = useFinancialStore();

  const isDark = theme === 'dark';
  // Фон/паддинги листа задаём инлайн-стилем (className на Animated.View ненадёжен в NativeWind).
  const sheetBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const iconColor = isDark ? '#9CA3AF' : '#6B7280';

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

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

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
          <View className={`w-10 h-1 ${isDark ? 'bg-gray-600' : 'bg-gray-400'} rounded-full self-center mb-6`} />

          {/* Header with Close Button */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className={`${textColor} text-lg font-['SFProDisplaySemiBold'] flex-1`}>
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="ml-4 p-1"
              activeOpacity={Opacity.press}
            >
              <MaterialIcons name="close" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View className="flex-row" style={{ gap: 12 }}>
            {/* Cancel Button */}
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 py-4 rounded-xl items-center"
              style={{ backgroundColor: cancelButtonColor }}
              activeOpacity={Opacity.press}
            >
              <Text className="text-white text-base font-['SFProDisplaySemiBold']">
                {cancelText}
              </Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={handleConfirm}
              className="flex-1 py-4 rounded-xl items-center"
              style={{ backgroundColor: confirmButtonColor }}
              activeOpacity={Opacity.press}
            >
              <Text className="text-white text-base font-['SFProDisplaySemiBold']">
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ConfirmationDrawer;
