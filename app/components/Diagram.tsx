import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomPieChart from './CustomChart';
import { Href, useRouter } from 'expo-router';
import useFinancialStore, { Asset } from '@/hooks/useStore';

import { filterAssetsByDate, DateFilterType } from '@/utils/dateFilters';
import { RecordKind, groupByCategory } from '@/constants/categories';
import { goBack } from '@/utils/navigation';

interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  color: string;
  percentage: number;
  /** Разбивка по подкатегориям — только в режиме группировки расходов. */
  subcategories?: { name: string; amount: number }[];
}

interface PieSegment {
  value: number;
  color: string;
  label?: string;
}

interface ChartScreenProps {
    backLink?:Href;
    assets: Asset[] | null
    /** Сложить записи по категориям (доходов или расходов) вместо отдельных строк. */
    categoryKind?: RecordKind
}

const ChartScreen = ({backLink, assets, categoryKind}:ChartScreenProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

        if (categoryKind) {
          setExpenseData(
            groupByCategory(categoryKind, filteredAssets).map((g) => ({
              id: g.category.id,
              name: g.category.name,
              amount: g.amount,
              color: g.category.color,
              percentage: total > 0 ? getPercentage(total, g.amount) : 0,
              subcategories: g.subcategories,
            }))
          )
          return
        }

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
    }, [assets, selectedPeriod, categoryKind])

  const chartData: PieSegment[]|undefined = expenseData?.map(item => ({
    value: item.amount,
    color: item.color,
    label: item.name,
  }));

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ` ${currency}`;
  };

  const handleBack = () => {
     goBack(backLink || "/main/finance")
  };

  return (
    <SafeAreaView edges={['top']} className={`flex-1 ${bgColor}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
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
                      ? 'bg-[#4CAF50] border-[#4CAF50]'
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
          <Text className="text-[#4CAF50] text-sm  font-['SFProDisplayRegular']">
            Итого: {formatAmount(totalAmount)}
          </Text>
        </View>

        {/* Expense Categories */}
        <View className="px-4 pb-6">
          <View className={`${cardBgColor} rounded-xl px-3`}>
            {expenseData?.map((item, index) => {
              const expandable = !!item.subcategories?.length;
              const expanded = expandable && expandedId === item.id;
              return (
              <View key={item.id}>
                <TouchableOpacity
                  className="flex-row items-center justify-between py-3"
                  disabled={!expandable}
                  activeOpacity={0.7}
                  onPress={() => setExpandedId(expanded ? null : item.id)}
                >
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
                  {expandable && (
                    <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={iconColor} style={{ marginLeft: 6 }} />
                  )}
                </TouchableOpacity>

                {expanded && item.subcategories!.map((sub) => (
                  <View key={sub.name} className="flex-row items-center justify-between pb-2 pl-7 pr-6">
                    <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular'] flex-1`}>
                      {sub.name}
                    </Text>
                    <Text className={`${textSecondaryColor} text-xs mr-3 font-['SFProDisplayRegular']`}>
                      {item.amount > 0 ? ((sub.amount / item.amount) * 100).toFixed(0) : 0}%
                    </Text>
                    <Text className={`${textColor} text-xs font-['SFProDisplayRegular']`}>
                      {formatAmount(sub.amount)}
                    </Text>
                  </View>
                ))}
              </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChartScreen;