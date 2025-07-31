import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ExpensesScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'regular' | 'irregular'>('regular');
  const [selectedCategory, setSelectedCategory] = useState<string>('obligatory');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('3months');

  const categories = [
    { id: 'obligatory', label: 'Обязательные' },
    { id: 'optional', label: 'Необязательные' },
  ];

  const periods = [
    { id: '3months', label: 'За месяц' },
    // Можно добавить другие периоды
  ];

  const handleAddExpense = () => {
    console.log('Добавить расход');
    // Здесь логика добавления расхода
  };

  const handleBack = () => {
    console.log('Назад');
    // Здесь логика навигации назад
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text className="text-white text-lg font-semibold">
          Расходы
        </Text>
        
        <View className="flex-row">
          <TouchableOpacity className="p-2 mr-1">
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Switcher */}
      <View className="mx-4 mb-4">
        <View className="bg-gray-800 rounded-lg p-1 flex-row">
          <TouchableOpacity
            className={`flex-1 py-2 px-4 rounded-md ${
              activeTab === 'regular' ? 'bg-gray-600' : ''
            }`}
            onPress={() => setActiveTab('regular')}
          >
            <Text className={`text-center text-sm ${
              activeTab === 'regular' ? 'text-white font-medium' : 'text-gray-400'
            }`}>
              Регулярные
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 py-2 px-4 rounded-md ${
              activeTab === 'irregular' ? 'bg-gray-600' : ''
            }`}
            onPress={() => setActiveTab('irregular')}
          >
            <Text className={`text-center text-sm ${
              activeTab === 'irregular' ? 'text-white font-medium' : 'text-gray-400'
            }`}>
              Нерегулярные
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category and Period Filters */}
      <View className="mx-4 mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className={`px-4 py-2 rounded-full border ${
                  selectedCategory === category.id
                    ? 'bg-white border-white'
                    : 'border-gray-600 bg-transparent'
                }`}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text className={`text-sm ${
                  selectedCategory === category.id ? 'text-black font-medium' : 'text-gray-300'
                }`}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
            
            {periods.map((period) => (
              <TouchableOpacity
                key={period.id}
                className={`px-4 py-2 rounded-full border flex-row items-center ${
                  selectedPeriod === period.id
                    ? 'bg-white border-white'
                    : 'border-gray-600 bg-transparent'
                }`}
                onPress={() => setSelectedPeriod(period.id)}
              >
                <Text className={`text-sm mr-1 ${
                  selectedPeriod === period.id ? 'text-black font-medium' : 'text-gray-300'
                }`}>
                  {period.label}
                </Text>
                <Ionicons 
                  name="chevron-down" 
                  size={14} 
                  color={selectedPeriod === period.id ? '#000000' : '#9CA3AF'} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Empty State */}
      <View className="flex-1 justify-center items-center px-8">
        <Text className="text-white text-xl font-medium mb-3 text-center">
          У вас пока нет расходов
        </Text>
        
        <Text className="text-gray-400 text-sm text-center mb-8 leading-5">
          Добавляйте ваши расходы, начните отслеживать свои денежные потоки
        </Text>
        
        <TouchableOpacity
          className="border border-gray-600 rounded-full px-6 py-3 flex-row items-center"
          onPress={handleAddExpense}
          activeOpacity={0.8}
        >
          <Text className="text-white text-sm font-medium mr-2">
            Добавить
          </Text>
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ExpensesScreen;