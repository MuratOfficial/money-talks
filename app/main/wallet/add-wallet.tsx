import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const AddWalletScreen = () => {
  const router = useRouter();
  const [cardName, setCardName] = useState('Kaspi Gold');
  const [selectedType, setSelectedType] = useState('Карта');
  const [amount, setAmount] = useState('300 000 ₸');
  const [selectedCurrency, setSelectedCurrency] = useState('Доллар $');

  const walletTypes = [
    { id: 'card', label: 'Карта' },
    { id: 'cash', label: 'Наличные' },
    { id: 'deposit', label: 'Депозит' },
    { id: 'broker', label: 'Брокерский...' }
  ];

  const currencies = [
    { id: 'kzt', label: 'Тенге KZT' },
    { id: 'usd', label: 'Доллар $' },
    { id: 'eur', label: 'Евро' }
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

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity 
          onPress={() => router.replace('/main')}
          className="p-2"
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text className="text-white text-lg font-['SFProDisplaySemiBold']">
          Добавить кошелек
        </Text>
        
        <View className="w-8" />
      </View>

      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Card Name */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
            Название карты
          </Text>
          <TextInput
            value={cardName}
            onChangeText={setCardName}
            className="bg-gray-800 rounded-xl px-4 py-4 text-white text-base font-['SFProDisplayRegular']"
            placeholder="Введите название"
            placeholderTextColor="#666"
          />
        </View>

        {/* Wallet Type */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
            Выберите тип кошелька
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {walletTypes.map((type) => (
              <View key={type.id} className="w-[48%] mb-3">
                <RadioButton
                  selected={selectedType === type.label}
                  onPress={() => setSelectedType(type.label)}
                  label={type.label}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Amount */}
        <View className="mb-6">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-3">
            Сумма
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            className="bg-gray-800 rounded-xl px-4 py-4 text-white text-base font-['SFProDisplayRegular']"
            placeholder="Введите сумму"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>

        {/* Currency */}
        <View className="mb-8">
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
            {/* Third currency takes full width in new row */}
            <View className="w-[48%]">
              {/* Empty space for layout */}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="px-4 pb-4">
        <TouchableOpacity
          onPress={() => {
            // Handle save logic
            console.log('Saving wallet:', {
              name: cardName,
              type: selectedType,
              amount: amount,
              currency: selectedCurrency
            });
            router.back();
          }}
          activeOpacity={0.8}
          className="w-full bg-[#4CAF50] py-4 rounded-xl items-center justify-center"
        >
          <Text className="text-white text-base font-['SFProDisplaySemiBold']">
            Сохранить
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddWalletScreen;