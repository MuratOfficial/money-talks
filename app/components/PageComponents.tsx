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
import { Href, useRouter } from 'expo-router';

interface PageComponentProps {
  title: string;
  emptyTitle: string;
  emptyDesc: string;
  categories?:{
    id:string;
    label:string;
  }[];
  tabs?:{
    id:string;
    label:string;
  }[];
  tab1?:string;
  tab2?:string;
  addLink?:Href;
}

interface Asset {
  id: string;
  name: string;
  amount: number;
  yield: number;
}

const PageComponent = ({title, emptyDesc, emptyTitle, categories, tab1, tab2, addLink}:PageComponentProps) => {
  const [activeTab, setActiveTab] = useState<'regular' | 'irregular'>('regular');
  const [selectedCategory, setSelectedCategory] = useState<string>('obligatory');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('3months');
  const router = useRouter();

   const liquidAssets: Asset[] = [
    { id: '1', name: 'Деньги в сейфе', amount: 5000000, yield: 0 },
    { id: '2', name: 'Безналичные', amount: 100000, yield: 0 },
    { id: '3', name: 'Наличные', amount: 100000, yield: 0 },
  ];

  const illiquidAssets: Asset[] = [
    // Можно добавить неликвидные активы
  ];

  const currentAssets = activeTab === 'regular' ? liquidAssets : illiquidAssets;
  const totalAmount = currentAssets.reduce((sum, asset) => sum + asset.amount, 0);

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₸';
  };


  const handleInfo = () => {
    console.log('Информация');
    // Логика показа информации
  };

  const handleAddAsset = () => {
    console.log('Добавить актив');
    // Логика добавления актива
  };

  const handleAssetInfo = (assetId: string) => {
    console.log('Информация об активе:', assetId);
    // Логика показа информации об активе
  };

  const handleEditAsset = (assetId: string) => {
    console.log('Редактировать актив:', assetId);
    // Логика редактирования актива
  };


  const periods = [
    { id: '3months', label: 'За месяц' },
    // Можно добавить другие периоды
  ];

  const handleAddExpense = () => {
    router.replace(addLink || "/main/finance")
  };

  const handleBack = () => {
    
    router.replace("/main/finance")
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text className="text-white text-base font-['SFProDisplaySemiBold']">
          {title}
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
      {tab1 && <View className="mx-4 mb-2">
        <View className="bg-[#7676803D] rounded-lg p-0.5 flex-row">
          <TouchableOpacity
            className={`flex-1 py-1 px-4 rounded-lg ${
              activeTab === 'regular' ? 'bg-[#636366]' : ''
            }`}
            onPress={() => setActiveTab('regular')}
          >
            <Text className={`text-center text-xs font-["SFProDisplayRegular"] text-white`}>
              {tab1}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 py-1 px-4 rounded-lg ${
              activeTab === 'irregular' ? 'bg-[#636366]' : ''
            }`}
            onPress={() => setActiveTab('irregular')}
          >
            <Text className={`text-center text-xs font-["SFProDisplayRegular"] text-white`}>
              {tab2}
            </Text>
          </TouchableOpacity>
        </View>
      </View>}
      

      {/* Category and Period Filters */}
      <View className="mx-4 mb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            {categories?.map((category) => (
              <TouchableOpacity
                key={category.id}
                className={`px-2 py-1 rounded-full border ${
                  selectedCategory === category.id
                    ? 'bg-[#2AA651] border-[#2AA651]'
                    : 'border-gray-600 bg-transparent'
                }`}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text className={`text-xs font-["SFProDisplayRegular"] text-white`}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
            
            {categories && periods.map((period) => (
              <TouchableOpacity
                key={period.id}
                className={`px-2 py-1 rounded-full border flex-row items-center ${
                  selectedPeriod === period.id
                    ? 'bg-[#2AA651] border-[#2AA651]'
                    : 'border-gray-600 bg-transparent'
                }`}
                onPress={() => setSelectedPeriod(period.id)}
              >
                <Text className={`text-xs mr-1 text-white font-["SFProDisplayRegular"] `}>
                  {period.label}
                </Text>
                <Ionicons 
                  name="chevron-down" 
                  size={14} 
                  color="#FFF" 
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {
        currentAssets ? <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Total Assets */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-gray-400 text-sm mb-1">
            Мои активы
          </Text>
          <Text className="text-emerald-400 text-xl font-semibold">
            {formatAmount(totalAmount)}
          </Text>
        </View>

        {/* Assets List */}
        <View className="bg-gray-800 rounded-xl p-4">
          {currentAssets.map((asset, index) => ( 
            <View key={asset.id}>
              <View className="flex-row items-center justify-between py-3">
                <View className="flex-1">
                  <Text className="text-white text-base font-medium mb-1">
                    {asset.name}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    Доходность {asset.yield}%
                  </Text>
                </View>
                
                <View className="flex-row items-center">
                  <Text className="text-white text-base font-medium mr-3">
                    {formatAmount(asset.amount)}
                  </Text>
                  
                  <TouchableOpacity 
                    onPress={() => handleAssetInfo(asset.id)}
                    className="p-1 mr-2"
                  >
                    <Ionicons name="information-circle-outline" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => handleEditAsset(asset.id)}
                    className="p-1"
                  >
                    <Ionicons name="create-outline" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {index < currentAssets.length - 1 && (
                <View className="h-px bg-gray-700 my-1" />
              )}
            </View>
          ))}
        </View>
      </ScrollView> : <View className="flex-1 justify-center items-center px-8">
        <Text className="text-white text-base font-['SFProDisplayRegular'] mb-3 text-center">
         {emptyTitle }
        </Text>
        
        <Text className="text-white/60 text-xs text-center font-['SFProDisplayRegular'] mb-8 leading-5">
          {emptyDesc}
        </Text>
        
        <TouchableOpacity
          className="border-2 border-white rounded-2xl px-8 py-1 flex-row items-center"
          onPress={handleAddExpense}
          activeOpacity={0.8}
        >
          <Text className="text-white text-sm font-medium mr-2 font-['SFProDisplayRegular']">
            Добавить
          </Text>
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      } 

      
    </SafeAreaView>
  );
};

export default PageComponent;