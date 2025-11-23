import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';
import { useSegments } from 'expo-router';

interface PaymentModalProps {
  visible: boolean;
    onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
    onClose
}) => {

    const segments = useSegments();

    const [value, setValue] = useState("");

    const {currentAsset, updateExpences, updateIncomes, updateActives, updatePassives, theme} = useFinancialStore();
    
    const isDark = theme === 'dark';
    const modalBgColor = isDark ? 'bg-[#1C1C1E]' : 'bg-white';
    const textColor = isDark ? 'text-white' : 'text-gray-900';
    const inputBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
    const inputTextColor = isDark ? 'text-white' : 'text-gray-900';
    const iconColor = isDark ? '#9CA3AF' : '#6B7280';


    const handleConfirm = () => {
        if(currentAsset){
            if(segments.find(x=>x==="expences")){
                updateExpences(currentAsset?.id, {
                    amount: currentAsset.amount + (Number(value) || 0)
                })
            }
            if(segments.find(x=>x==="incomes")){
                updateIncomes(currentAsset?.id, {
                    amount: currentAsset.amount + (Number(value) || 0)
                })
            }
            if(segments.find(x=>x==="actives")){
                updateActives(currentAsset?.id, {
                    amount: currentAsset.amount + (Number(value) || 0)
                })
            }
            if(segments.find(x=>x==="passives")){
                updatePassives(currentAsset?.id, {
                    amount: currentAsset.amount + (Number(value) || 0)
                })
            }

        }

        setValue("");

        onClose();

        
        
    }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/50 justify-end backdrop-blur-md"
        activeOpacity={1}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View className={`${modalBgColor} rounded-t-2xl px-4 py-6`}>
           
            <View className="flex-row items-center justify-between mb-6">
              <Text className={`${textColor} text-lg font-['SFProDisplayRegular'] font-medium flex-1`}>
                {currentAsset?.name || ""}
              </Text>
              <TouchableOpacity 
                onPress={onClose}
                className="ml-4 p-1"
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={24} color={iconColor} />
              </TouchableOpacity>
            </View>
            <TextInput
                value={value}
                onChangeText={setValue}
                className={`${inputBgColor} mb-2 rounded-xl px-4 py-3 ${inputTextColor} text-base font-['SFProDisplayRegular']`}
                placeholder="Введите сумму"
                placeholderTextColor={isDark ? "#666" : "#999"}
                keyboardType="numeric"
                autoCapitalize="none"
                />

            <View className="flex-row space-x-3">

              <TouchableOpacity
                onPress={handleConfirm}
                className="flex-1 py-3 rounded-xl items-center bg-[#4CAF50]"
                activeOpacity={0.8}
              >
                <Text className="text-white text-base font-medium font-['SFProDisplayRegular']">
                  Подтвердить
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default PaymentModal;