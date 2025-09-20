import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

const DropdownButton = ({ value, onPress, isFirst = false, isLast = false }:any) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 bg-white/10 rounded-xl px-3 py-3 flex-row items-center justify-between ${
        !isLast ? 'mr-2' : ''
      }`}
      activeOpacity={0.7}
    >
      <Text className="text-white text-sm font-['SFProDisplayRegular']">
        {value}
      </Text>
      <Ionicons name="chevron-down" size={16} color="white" />
    </TouchableOpacity>
  );

  export default DropdownButton;