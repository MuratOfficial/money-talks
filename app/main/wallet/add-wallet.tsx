import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useFinancialStore from '@/hooks/useStore';

const walletTypes = [
  { id: 'card', label: 'Карта', icon: 'card', color: '#4FC3F7' },
  { id: 'cash', label: 'Наличные', icon: 'document-text', color: '#66BB6A' },
  { id: 'deposit', label: 'Депозит', icon: 'trending-up', color: '#7986CB' },
  { id: 'broker', label: 'Брокерский счет', icon: 'briefcase', color: '#FFB74D' }
];

const currencies = [
  { id: 'kzt', label: 'Тенге ₸' },
  { id: 'usd', label: 'Доллар $' },
  { id: 'eur', label: 'Евро €' }
];

const AddWalletScreen = () => {
  const router = useRouter();
  const {
    addWallet,
    updateWallet,
    deleteWallet,
    getWalletById,
    getWalletBalance,
    currentEditWalletId,
    theme
  } = useFinancialStore();

  const isEditing = !!currentEditWalletId;

  const [cardName, setCardName] = useState('');
  const [selectedType, setSelectedType] = useState(walletTypes[0]);
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('Тенге ₸');

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBgColor = isDark ? 'bg-white/20' : 'bg-gray-100';
  const inputTextColor = isDark ? 'text-white' : 'text-gray-900';
  const cardBgColor = isDark ? 'bg-gray-800' : 'bg-gray-100';
  const iconColor = isDark ? 'white' : '#11181C';
  const borderColor = isDark ? 'border-gray-500' : 'border-gray-400';

  // Заполняем форму данными кошелька при редактировании
  useEffect(() => {
    if (currentEditWalletId) {
      const wallet = getWalletById(currentEditWalletId);
      if (wallet) {
        setCardName(wallet.name);
        setAmount(wallet.summ.toString());

        // Найти тип кошелька
        const foundType = walletTypes.find(t => t.id === wallet.type);
        if (foundType) setSelectedType(foundType);

        // Найти валюту по символу
        const currencyMap: Record<string, string> = {
          '₸': 'Тенге ₸',
          '$': 'Доллар $',
          '€': 'Евро €',
        };
        const currencyLabel = currencyMap[wallet.currency];
        if (currencyLabel) setSelectedCurrency(currencyLabel);
      }
    }
  }, [currentEditWalletId]);

  const handleSave = () => {
    const walletData = {
      name: cardName,
      type: selectedType.id,
      summ: Number(amount),
      currency: selectedCurrency[selectedCurrency.length - 1],
      icon: selectedType.icon,
      color: selectedType.color,
    };

    if (isEditing) {
      updateWallet(currentEditWalletId, walletData);
    } else {
      addWallet(walletData);
    }

    getWalletBalance();
    router.replace('/main');
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteWallet(currentEditWalletId);
    setShowDeleteModal(false);
    setTimeout(() => {
      getWalletBalance();
      router.replace('/main');
    }, 100);
  };

  const RadioButton = ({ selected, onPress, label }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className={`${cardBgColor} rounded-xl px-4 py-4 mb-3 flex-row items-center justify-between`}
      activeOpacity={0.7}
    >
      <Text className={`${textColor} text-base font-['SFProDisplayRegular'] line-clamp-1`}>
        {label}
      </Text>

      <View className={`w-6 h-6 rounded-full border-2 ${borderColor} items-center justify-center`}>
        {selected && (
          <View className={`w-3 h-3 rounded-full ${isDark ? 'bg-white' : 'bg-gray-900'}`} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          onPress={() => router.replace('/main')}
          className="p-2"
        >
          <Ionicons name="chevron-back" size={24} color={iconColor} />
        </TouchableOpacity>

        <Text className={`${textColor} text-lg font-['SFProDisplaySemiBold']`}>
          {isEditing ? 'Редактировать кошелек' : 'Добавить кошелек'}
        </Text>

        <View className="w-8" />
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Card Name */}
        <View className="mb-6">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-3`}>
            Название карты
          </Text>
          <TextInput
            value={cardName}
            onChangeText={setCardName}
            className={`${inputBgColor} rounded-xl px-4 py-4 ${inputTextColor} text-base font-['SFProDisplayRegular']`}
            placeholder="Введите название"
            placeholderTextColor={isDark ? "#666" : "#999"}
          />
        </View>

        {/* Wallet Type */}
        <View className="mb-6">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-3`}>
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
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-3`}>
            Сумма
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            className={`${inputBgColor} rounded-xl px-4 py-4 ${inputTextColor} text-base font-['SFProDisplayRegular']`}
            placeholder="Введите сумму"
            placeholderTextColor={isDark ? "#666" : "#999"}
            keyboardType="numeric"
          />
        </View>

        {/* Currency */}
        <View className="mb-8">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-3`}>
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

      {/* Buttons */}
      <View className="px-4 pb-4">
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.8}
          className="w-full bg-[#4CAF50] py-4 rounded-xl items-center justify-center"
        >
          <Text className="text-white text-base font-['SFProDisplaySemiBold']">
            Сохранить
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.8}
            className="w-full bg-red-500 py-4 rounded-xl items-center justify-center mt-3"
          >
            <Text className="text-white text-base font-['SFProDisplaySemiBold']">
              Удалить кошелек
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center px-4">
          <View className={`${cardBgColor} w-full rounded-2xl p-6`}>
            <Text className={`${textColor} text-xl font-['SFProDisplaySemiBold'] mb-2`}>
              Удалить кошелек
            </Text>
            <Text className={`${textSecondaryColor} text-base font-['SFProDisplayRegular'] mb-6`}>
              Вы уверены, что хотите удалить "{cardName}"?
            </Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                className={`flex-1 ${inputBgColor} py-3 rounded-xl items-center`}
              >
                <Text className={`${textColor} text-base font-['SFProDisplaySemiBold']`}>
                  Отмена
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                className="flex-1 bg-red-500 py-3 rounded-xl items-center ml-3"
              >
                <Text className="text-white text-base font-['SFProDisplaySemiBold']">
                  Удалить
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddWalletScreen;