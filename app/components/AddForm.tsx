import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import useFinancialStore from '@/hooks/useStore';

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  iconLibrary: 'ionicons' | 'material';
  color: string;
}

interface AddFormProps{
  backLink?: Href;
  name?: string;
  type?: "income" | "expence";
}

const AddForm = ({backLink, name, type}:AddFormProps) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const {addIncomes, addExpences} = useFinancialStore();

  const handleCategorySelect = (categoryId: string) => {
    try {
      setSelectedCategory(categoryId);
      console.log('Selected category:', categoryId);
    } catch (error) {
      console.error('Error selecting category:', error);
    }
  };

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

  const handleGoBack = () => {
    try {
      if (backLink) {
        router.replace(backLink);
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Navigation error:', error);
     
      router.replace('/main/finance');
    }
  };

  const handleAdd = () => {
    if (!title.trim() || !amount.trim() ) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    try {
      const selectedCat = categories.find(x => x.id === selectedCategory);
      
      if(type === "income"){
        addIncomes({
          name: title,
          amount: parseFloat(amount),
          icon: selectedCat?.icon,
          color: selectedCat?.color,
        });
      }

      if(type === "expence"){
        addExpences({
          name: title,
          amount: parseFloat(amount),
          icon: selectedCat?.icon,
          color: selectedCat?.color,
        });
      }

      const timeout = Platform.OS === 'android' ? 300 : 100;
      
      setTimeout(() => {
        try {
          router.replace(backLink || '/main/finance');
        } catch (navError) {
          console.error('Navigation error:', navError);
        }
      }, timeout);
      
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Ошибка', 'Не удалось добавить элемент');
    }
  };

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
        <TouchableOpacity 
          className="p-2 -ml-2"
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text className="text-white text-base font-['SFProDisplaySemiBold'] mx-auto">
          {name}
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        
       
        <View className="mb-4">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
            Название
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            className="bg-white/10 rounded-xl px-4 py-3 text-white text-base font-['SFProDisplayRegular']"
            placeholder="Введите название"
            placeholderTextColor="#666"
            keyboardType="default"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
            Сумма
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            className="bg-white/10 rounded-xl px-4 py-3 text-white text-base font-['SFProDisplayRegular']"
            placeholder="Введите сумму"
            placeholderTextColor="#666"
            keyboardType="decimal-pad"
            autoCapitalize="none"
          />
        </View>

        {/* Category Selection */}
        <View className="mb-8">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
            Выберите значок
          </Text>
          
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategorySelect(category.id)}
                activeOpacity={0.7}
                style={[
                  {
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 16,
                    backgroundColor: category.color,
                  },
                  selectedCategory === category.id && {
                    borderWidth: 2,
                    borderColor: 'white',
                  }
                ]}
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
          className={`w-full mb-2 py-4 rounded-xl items-center justify-center ${
            isFormValid ? 'bg-[#4CAF50]' : 'bg-gray-600'
          }`}
          onPress={handleAdd}
          disabled={!isFormValid}
          activeOpacity={0.8}
        >
          <Text className={`text-white text-base font-['SFProDisplaySemiBold']`}>
            Добавить
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddForm;