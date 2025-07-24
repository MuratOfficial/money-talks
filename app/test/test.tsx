import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const TestScreen = () => {
  const router = useRouter();
  const [selectedAge, setSelectedAge] = useState('30-39');

  const ageOptions = [
    { id: '18-29', label: 'A. 18-29' },
    { id: '30-39', label: 'B. 30-39' },
    { id: '40-49', label: 'C. 40-49' },
    { id: '50-59', label: 'D. 50-59' },
    { id: '60+', label: 'E. 60 и старше' }
  ];

  const handleNext = () => {
    // Логика перехода к следующему вопросу
    console.log('Selected age:', selectedAge);
    // router.push('/test/question2');
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2"
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text className="text-white text-lg font-['SFProDisplaySemiBold']">
          Тест
        </Text>
        
        <View className="w-8" />
      </View>

      {/* Instruction */}
      <View className="px-4 mb-6">
        <View className="flex-row items-center">
          <Ionicons name="information-circle-outline" size={16} color="#888" />
          <Text className="text-gray-400 text-sm ml-2 font-['SFProDisplayRegular']">
            Пройдите тест чтобы определить свой тип инвестора
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <Text className="text-white text-lg font-['SFProDisplayRegular'] mb-8">
          1. Каков ваш текущий возраст (годы)?
        </Text>

        {/* Answer Options */}
        <View className="space-y-4 mb-8">
          {ageOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => setSelectedAge(option.id)}
              className="flex-row items-center justify-between bg-gray-800 rounded-xl px-4 py-4"
              activeOpacity={0.7}
            >
              <Text className="text-white text-base font-['SFProDisplayRegular']">
                {option.label}
              </Text>
              
              <View className="w-6 h-6 rounded-full border-2 border-gray-500 items-center justify-center">
                {selectedAge === option.id && (
                  <View className="w-3 h-3 rounded-full bg-white" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View className="px-4 pb-4">
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          className="w-full bg-[#4CAF50] py-4 rounded-xl items-center justify-center"
        >
          <Text className="text-white text-base font-['SFProDisplaySemiBold']">
            Далее
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TestScreen;