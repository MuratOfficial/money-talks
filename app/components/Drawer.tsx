import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  animationType = "none"  
}) => {
  const [selectedOption, setSelectedOption] = useState(selectedValue);

  const sortOptions = options;

  const handleSelect = () => {
    onSelect(selectedOption);
    onClose();
  };

  const RadioOption = ({ option }: { option: string }) => (
    <TouchableOpacity
      onPress={() => setSelectedOption(option)}
      className="bg-[#333333] rounded-xl px-4 py-4 mb-3 flex-row items-center justify-between"
      activeOpacity={0.7}
    >
      <Text className="text-white text-base font-['SFProDisplayRegular']">
        {option}
      </Text>
      
      <View className="w-6 h-6 rounded-full border-2 border-gray-500 items-center justify-center">
        {selectedOption === option && (
          <View className="w-3 h-3 rounded-full bg-[#4CAF50]" />
        )}
      </View>
    </TouchableOpacity>
  );

  // Вычисляем максимальную высоту для скролла
  // Оставляем место для хедера, кнопки и отступов
  const maxScrollHeight = screenHeight * 0.6; // 60% от высоты экрана

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType={animationType}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        {/* Backdrop */}
        <TouchableOpacity 
          className="flex-1" 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        {/* Drawer Content */}
        <View className="bg-[#1C1C1E] rounded-t-3xl px-4 pt-6 pb-4">
          {/* Handle Bar */}
          <View className="w-10 h-1 bg-gray-600 rounded-full self-center mb-6" />
          
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-white text-lg font-['SFProDisplaySemiBold']">
              {title}
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              className="p-1"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Options - с ограничением высоты и прокруткой */}
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
            activeOpacity={0.8}
            className="w-full bg-[#4CAF50] py-4 rounded-xl items-center justify-center mt-2"
          >
            <Text className="text-white text-base font-['SFProDisplaySemiBold']">
              Выбрать
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default Drawer;