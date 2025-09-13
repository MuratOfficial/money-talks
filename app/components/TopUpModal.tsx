import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useFinancialStore from '@/hooks/useStore';

interface TopUpModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  currency?: string;
  goalId:string;
}

const TopUpModal: React.FC<TopUpModalProps> = ({
  visible,
  onClose,
  title = 'Продукты',
  currency = '₸',
  goalId
}) => {
  const [amount, setAmount] = useState('200');
  const inputRef = useRef<TextInput>(null);

  const {updateGoal, getGoalById} = useFinancialStore();

  const currentGoal = getGoalById(goalId);
  const allAmount = currentGoal?.amount ?? 0;
  const currentCollected = currentGoal?.collected ?? "0";

  function getProgress(){
    if(allAmount){
        return (parseFloat(amount) / parseFloat(allAmount)) * 100
    }
  }

  function makeCurrentCollected(){
    if(amount && parseFloat(amount) > 0){
        return (parseFloat(currentCollected) + parseFloat(amount))
    }   
  }

  // Автоматически фокусируемся на input при открытии модального окна
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // Небольшая задержка для завершения анимации
    }
  }, [visible]);



  const handleConfirm = () => {

    try {
    
        if (goalId && amount && parseFloat(amount) > 0) {
          // Обновление существующей цели
          updateGoal(goalId, ({
            collected: makeCurrentCollected()?.toString() ?? "0",
            progress: getProgress() ?? 0
          }));

            onClose();
            setAmount('200');
          
        } 
        
  
      } catch (error) {
        console.error('Ошибка при сохранении цели:', error);
        // добавить показ ошибки пользователю позже
      }
  };

  const handleAmountChange = (text: string) => {
    // Разрешаем только цифры и одну точку
    const filteredText = text.replace(/[^0-9.]/g, '');
    
    // Проверяем, что есть только одна точка
    const parts = filteredText.split('.');
    if (parts.length > 2) {
      return; // Игнорируем, если больше одной точки
    }
    
    // Ограничиваем до 2 знаков после запятой
    if (parts.length === 2 && parts[1].length > 2) {
      return;
    }
    
    setAmount(filteredText);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/70 justify-end"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          className="bg-gray-900 rounded-t-3xl px-4 pb-8"
          activeOpacity={1}
          onPress={() => {}} // Предотвращаем закрытие при нажатии на контент
        >
          {/* Header */}
          <View className="flex-row items-center justify-between py-4">
            <Text className="text-gray-400 text-base font-['SFProDisplayRegular']">
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-gray-700 items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* Amount Display */}
          <View className="items-center py-6">
            <Text className="text-white text-4xl font-['SFProDisplaySemiBold']">
              {amount || '0'} {currency}
            </Text>
          </View>

          {/* Hidden Input for triggering keyboard */}
          <TextInput
            ref={inputRef}
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
            placeholder="Введите сумму"
            placeholderTextColor="#6B7280"
            className="bg-gray-800 text-white px-4 py-4 rounded-2xl border border-gray-700 font-['SFProDisplayRegular'] text-center text-lg mb-4"
            selectionColor="#10B981"
            autoFocus={false}
          />

          {/* Quick Amount Buttons */}
          <View className="flex-row justify-between mb-6 px-2">
            {['1000', '5000', '10000', '20000'].map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                onPress={() => setAmount(quickAmount)}
                className="bg-gray-700 px-4 py-2 rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-white text-sm font-['SFProDisplayRegular']">
                  {quickAmount} {currency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!amount || parseFloat(amount) <= 0}
            className={`w-full py-4 rounded-2xl items-center ${
              amount && parseFloat(amount) > 0
                ? 'bg-green-600'
                : 'bg-gray-700'
            }`}
            activeOpacity={amount && parseFloat(amount) > 0 ? 0.8 : 1}
          >
            <Text className={`text-base font-['SFProDisplaySemiBold'] ${
              amount && parseFloat(amount) > 0 ? 'text-white' : 'text-gray-400'
            }`}>
              Пополнить
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default TopUpModal;