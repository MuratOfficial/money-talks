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
import useFinancialStore, { Asset } from '@/hooks/useStore';

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
  formItem: Asset | null
}

const AddForm = ({backLink, name, type, formItem}:AddFormProps) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');


  useEffect(()=>{
    if(formItem){
      setTitle(formItem.name);
      setAmount(formItem.amount.toString());
      setSelectedCategory(formItem.icon || '')
    }
  }, [formItem])

  const {addIncomes, addExpences, updateIncomes, updateExpences, currentCategoryOption, currentRegOption, theme} = useFinancialStore();
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const inputTextColor = isDark ? 'text-white' : 'text-gray-900';
  const iconColor = isDark ? '#FFFFFF' : '#11181C';

  const handleCategorySelect = (categoryId: string) => {
    try {
      setSelectedCategory(categoryId);
      console.log('Selected category:', categoryId);
    } catch (error) {
      console.error('Error selecting category:', error);
    }
  };

  const categories: CategoryItem[] = type==="income"?[
    { id: 'salary', name: 'Зарплата', icon: 'cash', iconLibrary: 'ionicons', color: '#10B981' },
    { id: 'freelance', name: 'Фриланс', icon: 'laptop', iconLibrary: 'ionicons', color: '#8B5CF6' },
    { id: 'rental', name: 'Аренда', icon: 'home', iconLibrary: 'ionicons', color: '#3B82F6' },
    { id: 'sales', name: 'Продажа', icon: 'trending-up', iconLibrary: 'ionicons', color: '#059669' },
    { id: 'gift', name: 'Подарки', icon: 'gift', iconLibrary: 'ionicons', color: '#EC4899' },
    { id: 'wallet', name: 'Кошелек', icon: 'wallet', iconLibrary: 'material', color: '#06B6D4' },
    { id: 'books', name: 'Книги', icon: 'library-books', iconLibrary: 'material', color: '#8110B9' },
    { id: 'bank', name: 'Банк', icon: 'account-balance', iconLibrary: 'material', color: '#14B8A6' },
    { id: 'card', name: 'Карта', icon: 'card', iconLibrary: 'ionicons', color: '#2563EB' },
    { id: 'attach-money', name: 'Деньги', icon: 'attach-money', iconLibrary: 'material', color: '#7C3AED' },
    { id: 'bitcoin', name: 'Криpto', icon: 'logo-bitcoin', iconLibrary: 'ionicons', color: '#F59E0B' },
    { id: 'investment', name: 'Инвестиции', icon: 'stats-chart', iconLibrary: 'ionicons', color: '#0891B2' },
    { id: 'business', name: 'Бизнес', icon: 'business', iconLibrary: 'ionicons', color: '#F97316' },
    { id: 'bonus', name: 'Бонус', icon: 'star', iconLibrary: 'ionicons', color: '#FBBF24' },
  
  ]: [
    { id: 'restaurant', name: 'Еда', icon: 'restaurant', iconLibrary: 'ionicons', color: '#F97316' },
    { id: 'taxi', name: 'Такси', icon: 'car', iconLibrary: 'ionicons', color: '#FBBF24' },
    { id: 'utilities', name: 'Коммуналка', icon: 'water', iconLibrary: 'ionicons', color: '#3B82F6' },
    { id: 'carwash', name: 'Мойка', icon: 'car-sport', iconLibrary: 'ionicons', color: '#06B6D4' },
    { id: 'charity', name: 'Благотворительность', icon: 'heart', iconLibrary: 'ionicons', color: '#EC4899' },
    { id: 'medical', name: 'Медицина', icon: 'medkit', iconLibrary: 'ionicons', color: '#EF4444' },
    { id: 'gift', name: 'Подарки', icon: 'gift', iconLibrary: 'ionicons', color: '#A855F7' },
    { id: 'shopping', name: 'Шопинг', icon: 'bag-handle', iconLibrary: 'ionicons', color: '#EC4899' },
    { id: 'mortgage', name: 'Ипотека', icon: 'home', iconLibrary: 'ionicons', color: '#8B5CF6' },
    { id: 'clothing', name: 'Одежда', icon: 'shirt', iconLibrary: 'ionicons', color: '#F472B6' },
    { id: 'card', name: 'Карта', icon: 'card', iconLibrary: 'ionicons', color: '#FDE1EF' },
    { id: 'bank', name: 'Банк', icon: 'account-balance', iconLibrary: 'material', color: '#10B981' },
    { id: 'phone', name: 'Телефон', icon: 'phone-portrait', iconLibrary: 'ionicons', color: '#F6A4CC' },
    { id: 'bitcoin', name: 'Криpto', icon: 'logo-bitcoin', iconLibrary: 'ionicons', color: '#F59E0B' },
    { id: 'wifi', name: 'WiFi', icon: 'wifi', iconLibrary: 'ionicons', color: '#14B8A6' },
    { id: 'play', name: 'Развлечения', icon: 'play', iconLibrary: 'ionicons', color: '#A78BFA' },
    { id: 'fitness', name: 'Спорт', icon: 'fitness', iconLibrary: 'ionicons', color: '#84CC16' },
    { id: 'business', name: 'Бизнес', icon: 'business', iconLibrary: 'ionicons', color: '#EC4899' },
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

      if(formItem){
        if(type === "income"){
        updateIncomes(formItem.id, {
          name: title,
          amount: parseFloat(amount),
          icon: selectedCat?.icon,
          iconType: selectedCat?.iconLibrary,
          color: selectedCat?.color,
          categoryTab: currentCategoryOption || "",
          regularity: currentRegOption || "regular"
        });
      }

      if(type === "expence"){
        updateExpences(formItem.id,{
          name: title,
          amount: parseFloat(amount),
          icon: selectedCat?.icon,
          iconType:selectedCat?.iconLibrary,
          color: selectedCat?.color,
          categoryTab: currentCategoryOption || "",
          regularity: currentRegOption || "regular"
        });
      }
      }else{
        if(type === "income"){
        addIncomes({
          name: title,
          amount: parseFloat(amount),
          icon: selectedCat?.icon,
          color: selectedCat?.color,
          categoryTab: currentCategoryOption || "",
          regularity: currentRegOption || "regular"
        });
      }

      if(type === "expence"){
        addExpences({
          name: title,
          amount: parseFloat(amount),
          icon: selectedCat?.icon,
          color: selectedCat?.color,
          categoryTab: currentCategoryOption || "",
          regularity: currentRegOption || "regular"
        });
      }
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
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#000000" : "#FFFFFF"} />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity 
          className="p-2 -ml-2"
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={iconColor} />
        </TouchableOpacity>
        
        <Text className={`${textColor} text-base font-['SFProDisplaySemiBold'] mx-auto`}>
          {name}
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        
       
        <View className="mb-4">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-2`}>
            Название
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            className={`${inputBgColor} rounded-xl px-4 py-3 ${inputTextColor} text-base font-['SFProDisplayRegular']`}
            placeholder="Введите название"
            placeholderTextColor={isDark ? "#666" : "#999"}
            keyboardType="default"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-2`}>
            Сумма
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            className={`${inputBgColor} rounded-xl px-4 py-3 ${inputTextColor} text-base font-['SFProDisplayRegular']`}
            placeholder="Введите сумму"
            placeholderTextColor={isDark ? "#666" : "#999"}
            keyboardType="decimal-pad"
            autoCapitalize="none"
          />
        </View>

        {/* Category Selection */}
        <View className="mb-8">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-2`}>
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
                    borderColor: isDark ? 'white' : '#11181C',
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
            isFormValid ? 'bg-[#4CAF50]' : (isDark ? 'bg-gray-600' : 'bg-gray-400')
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