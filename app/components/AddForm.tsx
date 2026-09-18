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
import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
import useFinancialStore, { Asset } from '@/hooks/useStore';
import { assetFormSchema, firstError, parseAmountInput } from '@/validation/forms';
import FadeInView from './FadeInView';
import { Opacity } from '@/constants/design';
import { goBack } from '@/utils/navigation';
import {
  RecordKind,
  findCategory,
  getCategories,
  resolveCategory,
  resolveSubcategory,
} from '@/constants/categories';

interface AddFormProps{
  backLink?: Href;
  name?: string;
  type?: "income" | "expence";
  formItem: Asset | null
}

const AddForm = ({backLink, name, type, formItem}:AddFormProps) => {
  const kind: RecordKind = type === 'income' ? 'income' : 'expence';

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');


  useEffect(()=>{
    if(formItem){
      setTitle(formItem.name);
      setAmount(formItem.amount.toString());
      // Старые записи без категории относим к ней по иконке.
      setSelectedCategory(resolveCategory(kind, formItem).id);
      setSelectedSubcategory(resolveSubcategory(kind, formItem)?.id || '');
    }
  }, [formItem, kind])

  const {addIncomes, addExpences, updateIncomes, updateExpences, currentCategoryOption, currentRegOption, theme} = useFinancialStore();

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const inputTextColor = isDark ? 'text-white' : 'text-gray-900';
  const iconColor = isDark ? '#FFFFFF' : '#11181C';

  const handleCategorySelect = (categoryId: string) => {
    if (categoryId !== selectedCategory) setSelectedSubcategory('');
    setSelectedCategory(categoryId);
  };

  const handleGoBack = () => {
    try {
      goBack(backLink || '/main/finance');
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
      const category = findCategory(kind, selectedCategory);
      const record = {
        name: title,
        amount: parseAmountInput(amount),
        icon: category?.icon,
        iconType: 'ionicons',
        color: category?.color,
        category: category?.id,
        subcategory: selectedSubcategory || undefined,
        categoryTab: currentCategoryOption || "",
        regularity: currentRegOption || "regular"
      };

      if (kind === 'income') {
        if (formItem) updateIncomes(formItem.id, record);
        else addIncomes(record);
      } else {
        if (formItem) updateExpences(formItem.id, record);
        else addExpences(record);
      }

      const timeout = Platform.OS === 'android' ? 300 : 100;

      setTimeout(() => {
        try {
          goBack(backLink || '/main/finance');
        } catch (navError) {
          console.error('Navigation error:', navError);
        }
      }, timeout);

    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Ошибка', 'Не удалось добавить элемент');
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

        <CategoryPicker
          kind={kind}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onSelectCategory={handleCategorySelect}
          onSelectSubcategory={setSelectedSubcategory}
          isDark={isDark}
          textColor={textColor}
          textSecondaryColor={textSecondaryColor}
        />
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
            {formItem ? 'Сохранить' : 'Добавить'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

interface CategoryPickerProps {
  kind: RecordKind;
  selectedCategory: string;
  selectedSubcategory: string;
  onSelectCategory: (id: string) => void;
  onSelectSubcategory: (id: string) => void;
  isDark: boolean;
  textColor: string;
  textSecondaryColor: string;
}

/** Выбор категории дохода/расхода и, если есть, подкатегории. */
const CategoryPicker = ({
  kind,
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  isDark,
  textColor,
  textSecondaryColor,
}: CategoryPickerProps) => {
  const categories = getCategories(kind);
  const category = findCategory(kind, selectedCategory);
  const chipBorder = isDark ? 'border-gray-600' : 'border-gray-300';

  return (
    <View className="mb-8">
      <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-2`}>
        {kind === 'income' ? 'Источник дохода' : 'Категория'}
      </Text>
      <View className="flex-row flex-wrap justify-between">
        {categories.map((c) => {
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
              <Text className={`${textColor} text-[11px] mt-1 text-center font-['SFProDisplayRegular']`} numberOfLines={2}>
                {c.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        {/* Выравнивание последней строки сетки */}
        {Array.from({ length: (4 - (categories.length % 4)) % 4 }).map((_, i) => (
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
