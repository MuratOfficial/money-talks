import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import useFinancialStore from '@/hooks/useStore';

const DropdownButton = ({ value, onPress, isFirst = false, isLast = false }:any) => {
  const { theme } = useFinancialStore();
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-white/10' : 'bg-gray-100';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const iconColor = isDark ? 'white' : '#11181C';
  
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 ${bgColor} rounded-xl px-3 py-3 flex-row items-center justify-between ${
        !isLast ? 'mr-2' : ''
      }`}
      activeOpacity={0.7}
    >
      <Text className={`${textColor} text-sm font-['SFProDisplayRegular']`}>
        {value}
      </Text>
      <Ionicons name="chevron-down" size={16} color={iconColor} />
    </TouchableOpacity>
  );
};

  export default DropdownButton;