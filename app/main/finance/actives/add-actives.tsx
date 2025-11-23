import React, { useEffect, useState } from 'react';
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
  const [additional, setAdditional] = useState<string>('');

  const [inc, setInc] = useState('');

  const {addActives, currentAsset, updateActives, currentRegOption, theme} = useFinancialStore();

  const router = useRouter();
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const inputTextColor = isDark ? 'text-white' : 'text-gray-900';
  const iconColor = isDark ? '#FFFFFF' : '#11181C';

  useEffect(()=>{
    if(currentAsset){
      setTitle(currentAsset.name);
      setAmount(currentAsset.amount.toString());
      setAdditional(currentAsset.additional?.toString() || "")
      setInc(currentAsset.yield?.toString() || "")
    }
  }, [currentAsset]);

  useEffect(()=>{
    if(amount && additional && parseFloat(amount) > 0 && parseFloat(additional) >0){
      const perc = (parseFloat(additional)/parseFloat(amount)) *100;

      setInc(perc.toFixed(2))
    }
  },[amount, additional])


  const handleBack = () => {
    router.replace( "/main/finance/actives/main")
  };

  const handleAddExpense = () => {
    
    if(currentAsset){
      updateActives(currentAsset.id, {
        name: title,
      amount: parseFloat(amount),
      additional: parseFloat(additional),
      yield: parseFloat(inc),
        regularity: currentRegOption || "regular"
      })
    }else{
      addActives({
      name: title,
      amount: parseFloat(amount),
      additional: parseFloat(additional),
      yield: parseFloat(inc),
      regularity: currentRegOption || "regular"
    })
    }
    

    router.replace("/main/finance/actives/main")

  };

  const isFormValid = title.trim() && amount.trim();

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#000000" : "#FFFFFF"} />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={24} color={iconColor} />
        </TouchableOpacity>
        
        <Text className={`${textColor} text-base font-['SFProDisplaySemiBold'] mx-auto`}>
         Добавить активы
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
            Текущая сумма
          </Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            className={`${inputBgColor} rounded-xl px-4 py-3 ${inputTextColor} text-base font-['SFProDisplayRegular']`}
            placeholder="Введите сумму"
            placeholderTextColor={isDark ? "#666" : "#999"}
            keyboardType="number-pad"
            autoCapitalize="none"
          />
          
        </View>
        <View className="mb-4">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-2`}>
            Доход в год
          </Text>
          <TextInput
            value={additional}
            onChangeText={setAdditional}
            className={`${inputBgColor} rounded-xl px-4 py-3 ${inputTextColor} text-base font-['SFProDisplayRegular']`}
            placeholder="Введите доход"
            placeholderTextColor={isDark ? "#666" : "#999"}
            keyboardType="number-pad"
            autoCapitalize="none"
          />
          
        </View>

        {inc && <View className="mb-4">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-2`}>
            Расчет доходности
          </Text>

          
          <Text className={`${inputBgColor} rounded-xl px-4 py-3 ${inputTextColor} text-base font-['SFProDisplayRegular']`}>
            {inc}
          </Text>
          
          
        </View>}
        
        
      
        

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