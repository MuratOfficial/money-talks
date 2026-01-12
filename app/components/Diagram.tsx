import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomPieChart from './CustomChart';
import { Href, useRouter } from 'expo-router';
import useFinancialStore, { Asset } from '@/hooks/useStore';

import { filterAssetsByDate, DateFilterType } from '@/utils/dateFilters';

interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface PieSegment {
  value: number;
  color: string;
  label?: string;
}

interface ChartScreenProps {
    backLink?:Href;
    assets: Asset[] | null
}

const ChartScreen = ({backLink, assets}:ChartScreenProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<DateFilterType>('За месяц');
  const {currency, theme} = useFinancialStore();  
  const router = useRouter();
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const iconColor = isDark ? '#FFFFFF' : '#11181C';
  const borderColor = isDark ? 'border-gray-600' : 'border-gray-300';

    const [expenseData, setExpenseData] = useState<ExpenseCategory[]|null>(null)

    const [totalAmount, setTotalAmount] = useState(0)

    function getPercentage(total:number, curr:number){

      if(curr>total){
        return 0
      }

      return ( curr / total)*100
    }

    useEffect(()=>{
      if(assets){
        // Фильтруем активы по выбранному периоду
        const filteredAssets = filterAssetsByDate(assets, selectedPeriod);

        // Вычисляем общую сумму сначала для отфильтрованных данных
        const total = filteredAssets.reduce((sum, item) => sum + item.amount, 0);
        setTotalAmount(total);

        // Используем вычисленное значение total для процентов
        setExpenseData(
          filteredAssets.map(x=>(
            {
              id:x.id|| "",
              name:x.name || "",
              amount:x.amount || 0,
              color:x.color || "",
              percentage: total > 0 ? getPercentage(total, x.amount) : 0
            }
          ))
        )
      }
    }, [assets, selectedPeriod])

  const chartData: PieSegment[]|undefined = expenseData?.map(item => ({
    value: item.amount,
    color: item.color,
    label: item.name,
  }));

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ` ${currency}`;
  };

  const handleBack = () => {
     router.replace(backLink || "/main/finance")
  };

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#000000" : "#FFFFFF"} />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 relative">
        <TouchableOpacity onPress={handleBack} className="p-2">
                  <Ionicons name="chevron-back" size={24} color={iconColor} />
                </TouchableOpacity>
        
        <Text className={`${textColor} text-lg font-['SFProDisplaySemiBold'] pr-4`}>
          Диаграмма
        </Text>
        <View></View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Pie Chart */}
        <View className="items-center mt-4 mb-6 px-4">
          <CustomPieChart 
            data={chartData || []}
            totalAmount={totalAmount}
            size={280}
            strokeWidth={30}
          />
        </View>

        {/* Period Selector */}
        <View className="px-4 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row space-x-3">
              {[
                { label: 'Сегодня', value: 'Сегодня' },
                { label: 'За месяц', value: 'За месяц' },
                { label: 'За год', value: 'За год' },
                { label: 'Все время', value: 'Все время' },
              ].map((period) => (
                <TouchableOpacity
                  key={period.value}
                  className={`px-2 py-1 rounded-full border ${
                    selectedPeriod === period.value
                      ? 'bg-[#2AA651] border-[#2AA651]'
                    : `${borderColor} bg-transparent`
                  }`}
                  onPress={() => setSelectedPeriod(period.value as DateFilterType)}
                >
                  <Text className={`text-xs font-['SFProDisplayRegular'] ${
                    selectedPeriod === period.value ? 'text-white font-medium' : textColor
                  }`}>
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Date and Total */}
        <View className="flex-row justify-between items-center px-4 mb-4">
          <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular']`}>
            1 янв 2025
          </Text>
          <Text className="text-emerald-400 text-sm  font-['SFProDisplayRegular']">
            Итого: {formatAmount(totalAmount)}
          </Text>
        </View>

        {/* Expense Categories */}
        <View className="px-4 pb-6">
          <View className={`${cardBgColor} rounded-xl px-3`}>
            {expenseData?.map((item, index) => (
              <View key={item.id}>
                <View className="flex-row items-center justify-between py-3">
                  <View className="flex-row items-center flex-1">
                    <View 
                      className="w-4 h-4 rounded mr-3"
                      style={{ backgroundColor: item.color }}
                    />
                    <View className="flex-1">
                      <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>
                        {item.name}
                      </Text>
                    </View>
                    <Text className={`${textSecondaryColor} text-sm mr-3 font-['SFProDisplayRegular']`}>
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </View>
                  
                  <Text className={`${textColor} text-sm font-medium font-['SFProDisplayRegular']`}>
                    {formatAmount(item.amount)}
                  </Text>
                </View>
                
               
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChartScreen;