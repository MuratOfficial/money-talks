  import React from "react";
import { Text, View } from "react-native";
import { Goal } from "@/hooks/useStore";
import CircularProgress from "./CircularProgress";
  
const GoalCard = ({ goal }:{goal:Goal}) => (
    <View className="bg-gray-800 rounded-xl p-4 mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-white text-base font-['SFProDisplaySemiBold'] mb-1">
            {goal.name}
          </Text>
          {goal.timeframe ? 
                      <Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-1">
                        Срок достижения цели {goal.timeframe.day} {goal.timeframe.month} {goal.timeframe.year}
                      </Text>:<Text className="text-gray-400 text-sm font-['SFProDisplayRegular'] mb-1">
                        Выберите срок
                        </Text>}
          <Text className="text-gray-400 text-xs font-['SFProDisplayRegular'] mb-1">
            {goal.amount}
          </Text>
          {goal.monthlyInvestment && (
            <Text className="text-gray-400 text-xs font-['SFProDisplayRegular']">
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

  export default GoalCard;