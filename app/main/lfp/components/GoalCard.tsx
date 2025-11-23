  import React from "react";
import { Text, View } from "react-native";
import { Goal } from "@/hooks/useStore";
import CircularProgress from "./CircularProgress";
import useFinancialStore from '@/hooks/useStore';
  
const GoalCard = ({ goal }:{goal:Goal}) => {
  const { theme } = useFinancialStore();
  const isDark = theme === 'dark';
  const cardBgColor = isDark ? 'bg-gray-800' : 'bg-gray-100';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = isDark ? 'text-gray-400' : 'text-gray-600';
  
  return (
    <View className={`${cardBgColor} rounded-xl p-4 mb-3`}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className={`${textColor} text-base font-['SFProDisplaySemiBold'] mb-1`}>
            {goal.name}
          </Text>
          {goal.timeframe ? 
                      <Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-1`}>
                        Срок достижения цели {goal.timeframe.day} {goal.timeframe.month} {goal.timeframe.year}
                      </Text>:<Text className={`${textSecondaryColor} text-sm font-['SFProDisplayRegular'] mb-1`}>
                        Выберите срок
                        </Text>}
          <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular'] mb-1`}>
            {goal.amount}
          </Text>
          {goal.monthlyInvestment && (
            <Text className={`${textSecondaryColor} text-xs font-['SFProDisplayRegular']`}>
              {goal.monthlyInvestment}
            </Text>
          )}
        </View>
        <CircularProgress
          progress={goal.progress ?? 0} 
        />
      </View>
    </View>
  );
};

  export default GoalCard;