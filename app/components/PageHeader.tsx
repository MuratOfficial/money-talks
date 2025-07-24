import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PageHeaderProps {
  title: string;
  description: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <View className="flex-row items-center justify-between mb-6">
      {/* Заголовок страницы */}
      <Text className="text-2xl font-semibold text-white">
        {title}
      </Text>
      
      {/* Контейнер для иконки и всплывающего текста */}
      <View className="relative">
        {/* Иконка информации */}
        <TouchableOpacity 
          onPress={() => setShowDescription(!showDescription)}
          className="p-2"
        >
          <Ionicons 
            name="information-circle-outline" 
            size={24} 
            className="text-white " 
          />
        </TouchableOpacity>

        {/* Всплывающее описание */}
        {showDescription && (
          <View className="absolute font-sans right-0 top-10 z-10 w-64 p-3 bg-white  rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <Text className="text-sm text-black">
              {description}
            </Text>
            {/* Треугольник-указатель */}
            <View className="absolute -top-2 right-3 w-4 h-4 bg-white dark:bg-gray-800 border-t border-l border-gray-200 dark:border-gray-700 transform rotate-45" />
          </View>
        )}
      </View>
    </View>
  );
};

export default PageHeader;