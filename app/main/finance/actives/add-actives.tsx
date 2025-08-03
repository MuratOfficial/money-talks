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



interface AddActivesFormProps{
  backLink?: Href;
  name?: string;
}

const AddActivesForm = ({backLink, name}:AddActivesFormProps) => {
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [planningHorizon, setPlanningHorizon] = useState('');

  const router = useRouter();


  const handleBack = () => {
    router.replace(backLink || "/main/finance/actives/main")
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
         Добавить активы
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
          label="Текущая сумма"
          value={planningHorizon}
          onChangeText={setPlanningHorizon}
          placeholder="Введите сумму"
        />
        <InputField
          label="Доход в год"
          value={planningHorizon}
          onChangeText={setPlanningHorizon}
          placeholder="Введите доход"
        />

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

export default AddActivesForm;