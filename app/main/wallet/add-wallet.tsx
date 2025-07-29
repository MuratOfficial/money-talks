import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useFinancialStore from '@/hooks/useStore';

const AddWalletScreen = () => {
  const router = useRouter();
  const [cardName, setCardName] = useState('Kaspi Gold');
  const [selectedType, setSelectedType] = useState({ id: 'card', label: 'Карта', icon:'card', color: '#4FC3F7' });
  const [amount, setAmount] = useState('300000');
  const [selectedCurrency, setSelectedCurrency] = useState('Доллар $');

  const { 
    wallets, 
    addWallet,

  } = useFinancialStore();

  const handleAddItem = () => {
    addWallet({

    name: cardName,
    type: selectedType.id,
    summ: Number(amount),
    currency: selectedCurrency[selectedCurrency.length - 1],
    icon: selectedType.icon,
    color:selectedType.color

    });

    router.replace('/main')
  };

  const walletTypes = [
    { id: 'card', label: 'Карта', icon:'card', color: '#4FC3F7' },
    { id: 'cash', label: 'Наличные', icon:'document-text', color: '#66BB6A' },
    { id: 'deposit', label: 'Депозит', icon:'trending-up', color: '#7986CB' },
    { id: 'broker', label: 'Брокерский счет', icon:'briefcase', color: '#FFB74D' }
  ];

  const currencies = [
    { id: 'kzt', label: 'Тенге KZT' },
    { id: 'usd', label: 'Доллар $' },
    { id: 'eur', label: 'Евро €' }
  ];

  const RadioButton = ({ selected, onPress, label }:any) => (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white/20 rounded-xl px-4 py-4 mb-3 flex-row items-center justify-between"
      activeOpacity={0.7}
    >
      <Text className="text-white text-base font-['SFProDisplayRegular'] line-clamp-1">
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
            className="bg-white/20 rounded-xl px-4 py-4 text-white text-base font-['SFProDisplayRegular']"
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
                  selected={selectedType.id === type.id}
                  onPress={() => setSelectedType(type)}
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
            className="bg-white/20 rounded-xl px-4 py-4 text-white text-base font-['SFProDisplayRegular']"
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
          onPress={handleAddItem}
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