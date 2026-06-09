import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';
import { Motion, Opacity } from '@/constants/design';

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
  const modalBgColor = isDark ? 'bg-[#1C1C1E]' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const iconColor = isDark ? '#9CA3AF' : '#6B7280';

  // --- Кастомная анимация: фон fade, лист slide снизу ---
  const [mounted, setMounted] = useState(visible);
  const anim = useRef(new Animated.Value(0)).current;
  const sheetHeight = useRef(screenHeight);

  useEffect(() => {
    if (visible) {
      setMounted(true);
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

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

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
        {/* Backdrop — только fade */}
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

        {/* Лист — только slide */}
        <Animated.View
          onLayout={(e) => { sheetHeight.current = e.nativeEvent.layout.height || screenHeight; }}
          style={{ transform: [{ translateY }] }}
          className={`${modalBgColor} rounded-t-3xl px-4 pt-6 pb-4`}
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
