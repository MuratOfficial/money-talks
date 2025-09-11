import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Drawer from './Drawer';
import useFinancialStore, { convertFormDataToGoal, Goal } from '@/hooks/useStore';

interface AddGoalFormProps {
  onClose?: () => void;
  onSave?: (goalId: string) => void;
  editGoalId?: string;
}

interface GoalData {
  name: string;
  type: 'short' | 'medium' | 'long';
  timeframe: {
    period: 'day' | 'month' | 'year';
    value: string;
  };
  currency: 'KZT' | 'USD';
  amount: string;
  inflationRate: string;
  returnRate: string;
  monthlyInvestment: string;
}

const AddGoalForm: React.FC<AddGoalFormProps> = ({ onClose, onSave, editGoalId }) => {
  const { addGoal, updateGoal, getGoalById, } = useFinancialStore(); 
  
  const [formData, setFormData] = useState<GoalData>({
    name: '',
    type: 'medium',
    timeframe: {
      period: 'month',
      value: '',
    },
    currency: 'USD',
    amount: '',
    inflationRate: '',
    returnRate: '',
    monthlyInvestment: '',
  });

  const [showDrawerDay, setShowDrawerDay] = useState(false);
  const [selectedSortDay, setSelectedSortDay] = useState('День');
  const [showDrawerMonth, setShowDrawerMonth] = useState(false);
  const [selectedSortMonth, setSelectedSortMonth] = useState('Месяц');
  const [showDrawerYear, setShowDrawerYear] = useState(false);
  const [selectedSortYear, setSelectedSortYear] = useState('Год');

  const goalTypes = [
    { key: 'short', label: 'Краткосрочный' },
    { key: 'medium', label: 'Среднесрочный' },
    { key: 'long', label: 'Долгосрочный' },
  ];

  const currencies = [
    { key: 'KZT', label: 'Тенге KZT' },
    { key: 'USD', label: 'Доллар $' },
  ];

  const days: string[] = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months: string[] = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const currentYear: number = new Date().getFullYear();
  const years: string[] = Array.from({ length: 100 }, (_, i) => (currentYear + 50 - i).toString());

  useEffect(() => {
    if (editGoalId) {
      const existingGoal = getGoalById(editGoalId);
      if (existingGoal) {
        setFormData({
          name: existingGoal.name,
          type: existingGoal.type,
          timeframe: { period: 'day', value: '' }, // Адаптируйте под вашу структуру
          currency: existingGoal.currency,
          amount: existingGoal.amount,
          inflationRate: existingGoal.inflationRate,
          returnRate: existingGoal.returnRate,
          monthlyInvestment: existingGoal.monthlyInvestment,
        });
        setSelectedSortDay(existingGoal.timeframe.day);
        setSelectedSortMonth(existingGoal.timeframe.month);
        setSelectedSortYear(existingGoal.timeframe.year);
      }
    }
  }, [editGoalId]);

  const handleSave = () => {
    if (!canSave) return;

    try {
      // Конвертируем данные формы в формат store
      const goalData = convertFormDataToGoal(
        formData,
        selectedSortDay,
        selectedSortMonth,
        selectedSortYear
      );

      let goalId: string;

      if (editGoalId) {
        // Обновление существующей цели
        const success = updateGoal(editGoalId, goalData);
        if (success) {
          goalId = editGoalId;
        } else {
          throw new Error('Не удалось обновить цель');
        }
        goalId = editGoalId; 
      } else {
        // Создание новой цели
        goalId = addGoal(goalData);
        goalId = 'temp-id'; // Временно для примера
      }

      // Вызываем callback с ID цели
      onSave?.(goalId);
      onClose?.();

    } catch (error) {
      console.error('Ошибка при сохранении цели:', error);
      // добавить показ ошибки пользователю
    }
  };

  const handleSortSelectDay = (value: string) => {
    setSelectedSortDay(value);
  };
  
  const handleSortSelectMonth = (value: string) => {
    setSelectedSortMonth(value);
  };
  
  const handleSortSelectYear = (value: string) => {
    setSelectedSortYear(value);
  };

  const canSave = formData.name.trim() !== '' && 
                  formData.amount.trim() !== '' &&
                  selectedSortDay !== 'День' &&
                  selectedSortMonth !== 'Месяц' &&
                  selectedSortYear !== 'Год';

  const DropdownButton = ({ value, onPress, isLast = false }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 px-4 py-3 rounded-2xl border flex-row justify-between bg-gray-700 border-gray-500 ${
        !isLast ? 'mr-2' : ''
      }`}
      activeOpacity={0.7}
    >
      <Text className="text-white text-sm font-['SFProDisplayRegular']">
        {value}
      </Text>
      <Ionicons name="chevron-down" size={16} color="white" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 pt-4">
        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-semibold font-['SFProDisplaySemiBold']">
          {editGoalId ? 'Редактировать цель' : 'Добавить цель'}
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-2">
          {/* Goal Name */}
          <View className="mb-6">
            <Text className="text-white text-base mb-3 font-['SFProDisplayRegular']">
              Название
            </Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Купить мебель"
              placeholderTextColor="#6B7280"
              className="bg-gray-800 text-white px-4 py-4 rounded-2xl border border-gray-700 font-['SFProDisplayRegular']"
            />
          </View>

          {/* Goal Types */}
          <View className="mb-6">
            <Text className="text-white text-base mb-3 font-['SFProDisplayRegular']">
              Типы целей
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {goalTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  onPress={() => setFormData({ ...formData, type: type.key as any })}
                  className={`px-4 py-3 rounded-2xl border ${
                    formData.type === type.key
                      ? 'bg-gray-700 border-gray-500'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center">
                    <View className={`w-5 h-5 rounded-full border-2 mr-3 ${
                      formData.type === type.key
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-500'
                    }`}>
                      {formData.type === type.key && (
                        <View className="w-full h-full items-center justify-center">
                          <View className="w-2 h-2 bg-white rounded-full" />
                        </View>
                      )}
                    </View>
                    <Text className="text-white font-['SFProDisplayRegular']">
                      {type.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Timeframe */}
          <View className="mb-6">
            <Text className="text-white text-base mb-3 font-['SFProDisplayRegular']">
              Срок достижения цели
            </Text>
            <View className="flex-row gap-3">
              <DropdownButton value={selectedSortDay} onPress={() => setShowDrawerDay(true)} />
              <DropdownButton value={selectedSortMonth} onPress={() => setShowDrawerMonth(true)} />
              <DropdownButton value={selectedSortYear} onPress={() => setShowDrawerYear(true)} isLast />
            </View>
          </View>

          {/* Currency */}
          <View className="mb-6">
            <Text className="text-white text-base mb-3 font-['SFProDisplayRegular']">
              Валюта
            </Text>
            <View className="flex-row gap-3">
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency.key}
                  onPress={() => setFormData({ ...formData, currency: currency.key as any })}
                  className={`flex-1 px-4 py-3 rounded-2xl border ${
                    formData.currency === currency.key
                      ? 'bg-gray-700 border-gray-500'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center justify-center">
                    <View className={`w-5 h-5 rounded-full border-2 mr-3 ${
                      formData.currency === currency.key
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-500'
                    }`}>
                      {formData.currency === currency.key && (
                        <View className="w-full h-full items-center justify-center">
                          <View className="w-2 h-2 bg-white rounded-full" />
                        </View>
                      )}
                    </View>
                    <Text className="text-white font-['SFProDisplayRegular']">
                      {currency.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount */}
          <View className="mb-6">
            <Text className="text-white text-base mb-3 font-['SFProDisplayRegular']">
              Сумма цели
            </Text>
            <TextInput
              value={formData.amount}
              onChangeText={(text) => setFormData({ ...formData, amount: text })}
              placeholder="300 000 $"
              placeholderTextColor="#6B7280"
              className="bg-gray-800 text-white px-4 py-4 rounded-2xl border border-gray-700 font-['SFProDisplayRegular']"
              keyboardType="numeric"
            />
          </View>

          {/* Inflation Rate */}
          <View className="mb-6">
            <Text className="text-white text-base mb-3 font-['SFProDisplayRegular']">
              Средняя инфляция в валюте
            </Text>
            <TextInput
              value={formData.inflationRate}
              onChangeText={(text) => setFormData({ ...formData, inflationRate: text })}
              placeholder="3,00%"
              placeholderTextColor="#6B7280"
              className="bg-gray-800 text-white px-4 py-4 rounded-2xl border border-gray-700 font-['SFProDisplayRegular']"
              keyboardType="numeric"
            />
          </View>

          {/* Return Rate */}
          <View className="mb-6">
            <Text className="text-white text-base mb-3 font-['SFProDisplayRegular']">
              Средняя доходность в валюте
            </Text>
            <TextInput
              value={formData.returnRate}
              onChangeText={(text) => setFormData({ ...formData, returnRate: text })}
              placeholder="8,00%"
              placeholderTextColor="#6B7280"
              className="bg-gray-800 text-white px-4 py-4 rounded-2xl border border-gray-700 font-['SFProDisplayRegular']"
              keyboardType="numeric"
            />
          </View>

          {/* Monthly Investment */}
          <View className="mb-6">
            <Text className="text-white text-base mb-3 font-['SFProDisplayRegular']">
              Расчет ежемесячной суммы инвестирования
            </Text>
            <TextInput
              value={formData.monthlyInvestment}
              onChangeText={(text) => setFormData({ ...formData, monthlyInvestment: text })}
              placeholder="5 000 $"
              placeholderTextColor="#6B7280"
              className="bg-gray-800 text-white px-4 py-4 rounded-2xl border border-gray-700 font-['SFProDisplayRegular']"
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="px-4 pb-8 pt-4">
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSave}
          className={`w-full py-4 rounded-2xl items-center ${
            canSave
              ? 'bg-green-600'
              : 'bg-gray-700'
          }`}
          activeOpacity={canSave ? 0.8 : 1}
        >
          <Text className={`text-base font-['SFProDisplaySemiBold'] ${
            canSave ? 'text-white' : 'text-gray-400'
          }`}>
            {editGoalId ? 'Сохранить' : 'Добавить'}
          </Text>
        </TouchableOpacity>
      </View>

      <Drawer 
        title='День'
        visible={showDrawerDay}
        onClose={() => setShowDrawerDay(false)}
        onSelect={handleSortSelectDay}
        selectedValue={selectedSortDay}
        options={days}
        animationType='fade'
      />
      
      <Drawer 
        title='Месяц'
        visible={showDrawerMonth}
        onClose={() => setShowDrawerMonth(false)}
        onSelect={handleSortSelectMonth}
        selectedValue={selectedSortMonth}
        options={months}
        animationType='fade'
      />
      
      <Drawer 
        title='Год'
        visible={showDrawerYear}
        onClose={() => setShowDrawerYear(false)}
        onSelect={handleSortSelectYear}
        selectedValue={selectedSortYear}
        options={years}
        animationType='fade'
      />
    </SafeAreaView>
  );
};

export default AddGoalForm;