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

    const {currentAsset, updateExpences, updateIncomes, updateActives, updatePassives} = useFinancialStore();


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
        {/* Drawer Content */}
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="bg-[#1C1C1E] rounded-t-2xl px-4 py-6">
            {/* Header with Close Button */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white text-lg font-['SFProDisplayRegular'] font-medium flex-1">
                {currentAsset?.name || ""}
              </Text>
              <TouchableOpacity 
                onPress={onClose}
                className="ml-4 p-1"
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <TextInput
                value={value}
                onChangeText={setValue}
                className="bg-white/10 mb-2 rounded-xl px-4 py-3 text-white text-base font-['SFProDisplayRegular']"
                placeholder="Введите сумму"
                placeholderTextColor="#666"
                keyboardType="default"
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