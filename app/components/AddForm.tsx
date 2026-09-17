import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import useFinancialStore, { Asset } from '@/hooks/useStore';
import { assetFormSchema, firstError, parseAmountInput } from '@/validation/forms';
import FadeInView from './FadeInView';
import { Opacity } from '@/constants/design';
import { EXPENSE_CATEGORIES, findExpenseCategory, resolveExpenseCategory } from '@/constants/expenseCategories';

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
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');


  useEffect(()=>{
    if(formItem){
      setTitle(formItem.name);
      setAmount(formItem.amount.toString());
      if (type === 'expence') {
        // Старые расходы без категории относим к ней по иконке.
        setSelectedCategory(resolveExpenseCategory(formItem).id);
        setSelectedSubcategory(formItem.subcategory || '');
      } else {
        // В state хранится id значка, а в записи — имя иконки; раньше их
        // сравнивали напрямую, и при редактировании значок не выделялся.
        setSelectedCategory(categories.find((c) => c.icon === formItem.icon)?.id || '');
      }
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
      if (categoryId !== selectedCategory) setSelectedSubcategory('');
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
  
  ]
    // У расходов значки заменены категориями из ТЗ — см. ExpenseCategoryPicker.
    : [];

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
    const validation = assetFormSchema.safeParse({
      title,
      amount,
      category: selectedCategory,
    });
    const error = firstError(validation);
    if (error) {
      Alert.alert('Ошибка', error);
      return;
    }

    try {
      const parsedAmount = parseAmountInput(amount);
      const selectedCat = categories.find(x => x.id === selectedCategory);
      const expenseCat = findExpenseCategory(selectedCategory);
      const expenseFields = expenseCat
        ? {
            icon: expenseCat.icon,
            iconType: 'ionicons',
            color: expenseCat.color,
            category: expenseCat.id,
            subcategory: selectedSubcategory || undefined,
          }
        : {};

      if(formItem){
        if(type === "income"){
        updateIncomes(formItem.id, {
          name: title,
          amount: parsedAmount,
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
          amount: parsedAmount,
          ...expenseFields,
          categoryTab: currentCategoryOption || "",
          regularity: currentRegOption || "regular"
        });
      }
      }else{
        if(type === "income"){
        addIncomes({
          name: title,
          amount: parsedAmount,
          icon: selectedCat?.icon,
          color: selectedCat?.color,
          categoryTab: currentCategoryOption || "",
          regularity: currentRegOption || "regular"
        });
      }

      if(type === "expence"){
        addExpences({
          name: title,
          amount: parsedAmount,
          ...expenseFields,
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
    <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity 
          className="p-2 -ml-2"
          onPress={handleGoBack}
          activeOpacity={Opacity.press}
        >
          <Ionicons name="chevron-back" size={24} color={iconColor} />
        </TouchableOpacity>
        
        <Text className={`${textColor} text-base font-['SFProDisplaySemiBold'] mx-auto`}>
          {name}
        </Text>
      </View>

      <FadeInView style={{ flex: 1 }}>
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

        {type === 'expence' ? (
          <ExpenseCategoryPicker
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSelectCategory={handleCategorySelect}
            onSelectSubcategory={setSelectedSubcategory}
            isDark={isDark}
            textColor={textColor}
            textSecondaryColor={textSecondaryColor}
          />
        ) : (
        <View className="mb-8">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-2`}>
            Выберите значок
          </Text>
          
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategorySelect(category.id)}
                activeOpacity={Opacity.press}
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
        )}
      </ScrollView>
      </FadeInView>

      {/* Add Button */}
      <View className='px-2 pb-2'>
        <TouchableOpacity
          className={`w-full mb-2 py-4 rounded-xl items-center justify-center ${
            isFormValid ? 'bg-[#4CAF50]' : (isDark ? 'bg-gray-600' : 'bg-gray-400')
          }`}
          onPress={handleAdd}
          disabled={!isFormValid}
          activeOpacity={Opacity.press}
        >
          <Text className={`text-white text-base font-['SFProDisplaySemiBold']`}>
            Добавить
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

interface ExpenseCategoryPickerProps {
  selectedCategory: string;
  selectedSubcategory: string;
  onSelectCategory: (id: string) => void;
  onSelectSubcategory: (id: string) => void;
  isDark: boolean;
  textColor: string;
  textSecondaryColor: string;
}

/** Выбор категории расхода и, если есть, подкатегории. */
const ExpenseCategoryPicker = ({
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  isDark,
  textColor,
  textSecondaryColor,
}: ExpenseCategoryPickerProps) => {
  const category = findExpenseCategory(selectedCategory);
  const chipBorder = isDark ? 'border-gray-600' : 'border-gray-300';

  return (
    <View className="mb-8">
      <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-2`}>
        Категория
      </Text>
      <View className="flex-row flex-wrap justify-between">
        {EXPENSE_CATEGORIES.map((c) => {
          const selected = c.id === selectedCategory;
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => onSelectCategory(c.id)}
              activeOpacity={Opacity.press}
              className="w-[23%] items-center mb-4"
            >
              <View
                style={[
                  { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: c.color },
                  selected && { borderWidth: 2, borderColor: isDark ? 'white' : '#11181C' },
                ]}
              >
                <Ionicons name={c.icon as any} size={24} color="#FFFFFF" />
              </View>
              <Text className={`${textColor} text-xs mt-1 text-center font-['SFProDisplayRegular']`} numberOfLines={1}>
                {c.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        {/* Выравнивание последней строки сетки */}
        {Array.from({ length: (4 - (EXPENSE_CATEGORIES.length % 4)) % 4 }).map((_, i) => (
          <View key={i} className="w-[23%]" />
        ))}
      </View>

      {category && category.subcategories.length > 0 && (
        <>
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-2 mt-2`}>
            Подкатегория
          </Text>
          <View className="flex-row flex-wrap">
            {category.subcategories.map((sub) => {
              const selected = sub.id === selectedSubcategory;
              return (
                <TouchableOpacity
                  key={sub.id}
                  // Повторное нажатие снимает выбор: подкатегория необязательна.
                  onPress={() => onSelectSubcategory(selected ? '' : sub.id)}
                  activeOpacity={Opacity.press}
                  className={`px-4 py-2 mr-2 mb-2 rounded-full border ${selected ? 'border-[#4CAF50]' : chipBorder}`}
                  style={selected ? { backgroundColor: '#4CAF50' } : undefined}
                >
                  <Text className={`text-sm font-['SFProDisplayRegular'] ${selected ? 'text-white' : textColor}`}>
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
};

export default AddForm;