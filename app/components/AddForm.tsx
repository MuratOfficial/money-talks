import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  iconLibrary: 'ionicons' | 'material';
  color: string;
}

interface AddExpenseScreenProps{
    backLink?: Href;
}

const AddExpenseScreen = ({backLink}:AddExpenseScreenProps) => {
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [planningHorizon, setPlanningHorizon] = useState('');

  const router = useRouter();

  const categories: CategoryItem[] = [
    { id: 'card', name: 'Карта', icon: 'card', iconLibrary: 'ionicons', color: '#3B82F6' },
    { id: 'bank', name: 'Банк', icon: 'account-balance', iconLibrary: 'material', color: '#10B981' },
    { id: 'phone', name: 'Телефон', icon: 'phone-portrait', iconLibrary: 'ionicons', color: '#8B5CF6' },
    { id: 'bitcoin', name: 'Криpto', icon: 'logo-bitcoin', iconLibrary: 'ionicons', color: '#F59E0B' },
    { id: 'export', name: 'Экспорт', icon: 'share-outline', iconLibrary: 'ionicons', color: '#06B6D4' },
    { id: 'wifi', name: 'WiFi', icon: 'wifi', iconLibrary: 'ionicons', color: '#10B981' },
    { id: 'play', name: 'Развлечения', icon: 'play', iconLibrary: 'ionicons', color: '#EC4899' },
    { id: 'restaurant', name: 'Еда', icon: 'restaurant', iconLibrary: 'ionicons', color: '#F97316' },
    { id: 'shopping', name: 'Покупки', icon: 'bag-handle', iconLibrary: 'ionicons', color: '#06B6D4' },
    { id: 'fitness', name: 'Спорт', icon: 'fitness', iconLibrary: 'ionicons', color: '#84CC16' },
    { id: 'warning', name: 'Предупреждение', icon: 'warning', iconLibrary: 'ionicons', color: '#3B82F6' },
    { id: 'business', name: 'Бизнес', icon: 'business', iconLibrary: 'ionicons', color: '#F59E0B' },
  ];

  const handleBack = () => {
    router.replace(backLink || "/main/finance")
  };

  const handleAddExpense = () => {
    if (!title.trim() || !amount.trim() || !selectedCategory) {
      console.log('Заполните все поля');
      return;
    }
    
    console.log('Добавить расход:', {
      title: title.trim(),
      amount: parseFloat(amount),
      category: selectedCategory,
    });
    // Логика добавления расхода
  };

    const InputField = ({ label, value, onChangeText, placeholder }:any) => (
      <View className="mb-4">
        <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
          {label}
        </Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          className="bg-white/10 rounded-xl px-4 py-3 text-white text-base font-['SFProDisplayRegular']"
          placeholder={placeholder}
          placeholderTextColor="#666"
        />
      </View>
    );

  const renderIcon = (category: CategoryItem) => {
    const iconProps = {
      size: 24,
      color: '#FFFFFF',
    };

    if (category.iconLibrary === 'ionicons') {
      return <Ionicons name={category.icon as any} {...iconProps} />;
    } else {
      return <MaterialIcons name={category.icon as any} {...iconProps} />;
    }
  };

  const isFormValid = title.trim() && amount.trim() && selectedCategory;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text className="text-white text-base font-['SFProDisplaySemiBold'] mx-auto">
          Добавить расход
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        
        <InputField
          label="Название"
          value={planningHorizon}
          onChangeText={setPlanningHorizon}
          placeholder="Введите название"
        />
        <InputField
          label="Сумма"
          value={planningHorizon}
          onChangeText={setPlanningHorizon}
          placeholder="Введите сумму"
        />

        {/* Category Selection */}
        <View className="mb-8">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
            Выберите значок
          </Text>
          
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className={`w-16 h-16 rounded-full justify-center items-center mb-4 ${
                  selectedCategory === category.id ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                }`}
                style={{ backgroundColor: category.color }}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.8}
              >
                {renderIcon(category)}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Add Button */}
      <View className='px-2 pb-2'>
            <TouchableOpacity
          className={`w-full mb-2 py-4 rounded-xl items-center justify-center bg-[#4CAF50] `}
          onPress={handleAddExpense}
          disabled={!isFormValid}
          activeOpacity={0.8}
        >
          <Text className={`text-white text-base font-['SFProDisplaySemiBold'] 
            `}>
            Добавить
          </Text>
        </TouchableOpacity>

      </View>
        
     
    </SafeAreaView>
  );
};

export default AddExpenseScreen;