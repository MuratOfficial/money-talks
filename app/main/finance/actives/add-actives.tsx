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
import useFinancialStore from '@/hooks/useStore';

const AddActivesForm = () => {
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [inc, setInc] = useState('');

  const {addActives} = useFinancialStore();

  const router = useRouter();


  const handleBack = () => {
    router.replace( "/main/finance/actives/main")
  };

  const handleAddExpense = () => {
    
    
    addActives({
      name: title,
      amount: parseFloat(amount),
      yield: parseFloat(inc)
    })

    router.replace("/main/finance/actives/main")

  };




  const isFormValid = title.trim() && amount.trim();

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
            Текущая сумма
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            className="bg-white/10 rounded-xl px-4 py-3 text-white text-base font-['SFProDisplayRegular']"
            placeholder="Введите сумму"
            placeholderTextColor="#666"
            keyboardType="number-pad"
            autoCapitalize="none"
          />
          
        </View>
        <View className="mb-4">
          <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-2">
            Доход в год
          </Text>
          <TextInput
            value={inc}
            onChangeText={setInc}
            className="bg-white/10 rounded-xl px-4 py-3 text-white text-base font-['SFProDisplayRegular']"
            placeholder="Введите доход"
            placeholderTextColor="#666"
            keyboardType="number-pad"
            autoCapitalize="none"
          />
          
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

export default AddActivesForm;