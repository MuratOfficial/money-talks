import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const AddGoalScreen = () => {
  const router = useRouter();
  const [goalName, setGoalName] = useState('Купить мебель');
  const [selectedType, setSelectedType] = useState('Среднесрочный');
  const [selectedCurrency, setSelectedCurrency] = useState('Доллар $');
  const [goalAmount, setGoalAmount] = useState('300 000 $');
  const [averageInfo, setAverageInfo] = useState('3.00%');
  const [averageIncome, setAverageIncome] = useState('8.00%');
  const [monthlyInvestment, setMonthlyInvestment] = useState('5,000 $');
  
  // Dropdown states
  const [dayDropdown, setDayDropdown] = useState('День');
  const [monthDropdown, setMonthDropdown] = useState('Месяц');
  const [yearDropdown, setYearDropdown] = useState('Год');

  const goalTypes = [
    { id: 'short', label: 'Краткосрочный' },
    { id: 'medium', label: 'Среднесрочный' },
    { id: 'long', label: 'Долгосрочный' }
  ];

  const currencies = [
    { id: 'kzt', label: 'Тенге KZT' },
    { id: 'usd', label: 'Доллар $' }
  ];

  const RadioButton = ({ selected, onPress, label }:any) => (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gray-800 rounded-xl px-4 py-4 mb-3 flex-row items-center justify-between"
      activeOpacity={0.7}
    >
      <Text className="text-white text-base font-['SFProDisplayRegular']">
        {label}
      </Text>
      
      <View className="w-6 h-6 rounded-full border-2 border-gray-500 items-center justify-center">
        {selected && (
          <View className="w-3 h-3 rounded-full bg-white" />
        )}
      </View>
    </TouchableOpacity>
  );

  const DropdownButton = ({ value, onPress }:any) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 bg-gray-800 rounded-xl px-4 py-4 flex-row items-center justify-between mr-3 last:mr-0"
      activeOpacity={0.7}
    >
      <Text className="text-white text-base font-['SFProDisplayRegular']">
        {value}
      </Text>
      <Ionicons name="chevron-down" size={20} color="white" />
    </TouchableOpacity>
  );

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }:any) => (
    <View className="mb-6">
      <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className="bg-gray-800 rounded-xl px-4 py-4 text-white text-base font-['SFProDisplayRegular']"
        placeholder={placeholder}
        placeholderTextColor="#666"
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity 
          onPress={() => router.replace('/main/goals/main')}
          className="p-2"
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text className="text-white text-lg font-['SFProDisplaySemiBold']">
          Добавить цель
        </Text>
        
        <View className="w-8" />
      </View>

      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Goal Name */}
        <InputField
          label="Название"
          value={goalName}
          onChangeText={setGoalName}
          placeholder="Введите название цели"
        />

        {/* Goal Types */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
            Типы целей
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {goalTypes.map((type) => (
              <View key={type.id} className="w-[48%] mb-3">
                <RadioButton
                  selected={selectedType === type.label}
                  onPress={() => setSelectedType(type.label)}
                  label={type.label}
                />
              </View>
            ))}
            {/* Third option takes full width */}
            <View className="w-full">
              <RadioButton
                selected={selectedType === 'Долгосрочный'}
                onPress={() => setSelectedType('Долгосрочный')}
                label="Долгосрочный"
              />
            </View>
          </View>
        </View>

        {/* Deadline */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
            Срок достижения цели
          </Text>
          <View className="flex-row">
            <DropdownButton value={dayDropdown} onPress={() => console.log('Day dropdown')} />
            <DropdownButton value={monthDropdown} onPress={() => console.log('Month dropdown')} />
            <DropdownButton value={yearDropdown} onPress={() => console.log('Year dropdown')} />
          </View>
        </View>

        {/* Currency */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
            Валюта
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {currencies.map((currency) => (
              <View key={currency.id} className="w-[48%] mb-3">
                <RadioButton
                  selected={selectedCurrency === currency.label}
                  onPress={() => setSelectedCurrency(currency.label)}
                  label={currency.label}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Goal Amount */}
        <InputField
          label="Сумма цели"
          value={goalAmount}
          onChangeText={setGoalAmount}
          placeholder="Введите сумму"
          keyboardType="numeric"
        />

        {/* Average Info Rate */}
        <InputField
          label="Средняя инфляция в валюте"
          value={averageInfo}
          onChangeText={setAverageInfo}
          placeholder="Введите процент"
          keyboardType="numeric"
        />

        {/* Average Income Rate */}
        <InputField
          label="Средняя доходность в валюте"
          value={averageIncome}
          onChangeText={setAverageIncome}
          placeholder="Введите процент"
          keyboardType="numeric"
        />

        {/* Monthly Investment */}
        <InputField
          label="Расчет ежемесячной суммы инвестирования"
          value={monthlyInvestment}
          onChangeText={setMonthlyInvestment}
          placeholder="Введите сумму"
          keyboardType="numeric"
        />

        <View className="h-20" />
      </ScrollView>

      {/* Add Button */}
      <View className="px-4 pb-4">
        <TouchableOpacity
          onPress={() => {
            // Handle save logic
            console.log('Adding goal:', {
              name: goalName,
              type: selectedType,
              currency: selectedCurrency,
              amount: goalAmount,
              averageInfo,
              averageIncome,
              monthlyInvestment
            });
            router.back();
          }}
          activeOpacity={0.8}
          className="w-full bg-[#4CAF50] py-4 rounded-xl items-center justify-center"
        >
          <Text className="text-white text-base font-['SFProDisplaySemiBold']">
            Добавить
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddGoalScreen;