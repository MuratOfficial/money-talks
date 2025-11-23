import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';

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

const ConfirmationDrawer: React.FC<ConfirmationDrawerProps> = ({
  visible,
  title,
  onClose,
  onConfirm,
  onCancel,
  confirmText = "Да",
  cancelText = "Нет",
  confirmButtonColor = "#16A34A", // green-600
  cancelButtonColor = "#374151"   // gray-700
}) => {
  const { theme } = useFinancialStore();
  
  const isDark = theme === 'dark';
  const modalBgColor = isDark ? 'bg-[#1C1C1E]' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const iconColor = isDark ? '#9CA3AF' : '#6B7280';
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  const handleBackdropPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity 
        className="flex-1 bg-black/50 justify-end backdrop-blur-md"
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        {/* Drawer Content */}
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View className={`${modalBgColor} rounded-t-2xl px-4 py-6`}>
            {/* Header with Close Button */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className={`${textColor} text-lg font-['SFProDisplayRegular'] font-medium flex-1`}>
                {title}
              </Text>
              <TouchableOpacity 
                onPress={onClose}
                className="ml-4 p-1"
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={24} color={iconColor} />
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              {/* Cancel Button */}
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 py-3 rounded-lg items-center"
                style={{ backgroundColor: cancelButtonColor }}
                activeOpacity={0.8}
              >
                <Text className="text-white text-base font-medium font-['SFProDisplayRegular']">
                  {cancelText}
                </Text>
              </TouchableOpacity>

              {/* Confirm Button */}
              <TouchableOpacity
                onPress={handleConfirm}
                className="flex-1 py-3 rounded-lg items-center"
                style={{ backgroundColor: confirmButtonColor }}
                activeOpacity={0.8}
              >
                <Text className="text-white text-base font-medium font-['SFProDisplayRegular']">
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default ConfirmationDrawer;