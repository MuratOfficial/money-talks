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



interface AddPassivesFormProps{
  backLink?: Href;
  name?: string;
}

const AddPassivesForm = ({backLink, name}:AddPassivesFormProps) => {
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [planningHorizon, setPlanningHorizon] = useState('');

  const router = useRouter();

  const {addPassives, currentAsset} = useFinancialStore();

  
    useEffect(()=>{
      if(currentAsset){
        setTitle(currentAsset.name);
        setAmount(currentAsset.amount.toString());
        setPlanningHorizon(currentAsset.yield?.toString() || "")
      }
    }, [currentAsset])


  const handleBack = () => {
    router.replace(backLink || "/main/finance/passives/main")
  };

  const handleAdd = () => {
    if (!title.trim() || !amount.trim() || !planningHorizon) {
      console.log('Заполните все поля');
      return;
    }

    addPassives({
      name: title,
      amount: parseFloat(amount),
      yield: parseFloat(planningHorizon)
    })
    
   router.replace("/main/finance/passives/main")
    
  };

  const isFormValid = title.trim() && amount.trim() && planningHorizon;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text className="text-white text-base font-['SFProDisplaySemiBold'] mx-auto">
         Добавить пассивы
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
                    Текущая сумма пассива
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
                    Расход на содержание пассива в год
                  </Text>
                  <TextInput
                    value={planningHorizon}
                    onChangeText={setPlanningHorizon}
                    className="bg-white/10 rounded-xl px-4 py-3 text-white text-base font-['SFProDisplayRegular']"
                    placeholder="Введите расход пассива"
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
          onPress={handleAdd}
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

export default AddPassivesForm;