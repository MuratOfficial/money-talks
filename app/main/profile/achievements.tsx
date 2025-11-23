import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useFinancialStore from '@/hooks/useStore';

const AchievementsScreen = () => {
  const router = useRouter();
  const { theme } = useFinancialStore();
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white/80' : 'text-gray-900';
  const iconColor = isDark ? 'white' : '#11181C';
  
  const images = {
    ach1: require('../../../assets/images/ach1.png'),
    ach2: require('../../../assets/images/ach2.png'),
    ach3: require('../../../assets/images/ach3.png'),
    ach4: require('../../../assets/images/ach4.png'),
    ach5: require('../../../assets/images/ach5.png'),
    ach6: require('../../../assets/images/ach6.png'),
    };

  const menuItems = [
    {
      id: '1',
      title: 'Первые шаги',
      image: images["ach1"],
      hasArrow: true,
      onPress: () => console.log('Онлайн оплата')
    },
    {
      id: '2',
      title: 'Дисциплина',
      image: images["ach2"],
      hasArrow: true,
      onPress: () => console.log('Онлайн оплата')
    },
    {
      id: '3',
      title: 'Месяц контроля',
      image: images["ach3"],
      hasArrow: true,
      onPress: () => console.log('Политика конфиденциальности')
    },
    {
      id: '4',
      title: 'Оптимизатор',
      image: images["ach4"],
      hasArrow: true,
      onPress: () => console.log('Политика конфиденциальности')
    },
    {
      id: '5',
      title: 'Накопитель',
      image: images["ach5"],
      hasArrow: true,
      onPress: () => console.log('Политика конфиденциальности')
    },
    {
      id: '6',
      title: 'Первая цель',
      image: images["ach6"],
      hasArrow: true,
      onPress: () => console.log('Политика конфиденциальности')
    }
    
  ];

  const MenuItem = ({ item }:{item:any}) => (
    <TouchableOpacity
      onPress={item.onPress}
      className="  flex flex-col items-center justify-between"
      activeOpacity={0.7}
    >
      <View className="flex aspect-square flex-row justify-center items-center w-full rounded-full">
        <Image 
            source={item.image}
            className="w-full h-fit"
            resizeMode="contain"
        />
      </View>
      
      <Text className={`${textColor} text-xs text-center font-['SFProDisplayRegular'] ml-3`}>
          {item.title}
        </Text>
      

    </TouchableOpacity>
  );

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
         <View className="flex-row items-center  py-3 pb-6 w-full">
                <TouchableOpacity  onPress={()=>router.replace('/main/profile')}>
                   <Ionicons name="chevron-back" size={24} color={iconColor} />
                </TouchableOpacity>
                <Text className={`${isDark ? 'text-white' : 'text-gray-900'} text-center w-full text-lg font-semibold font-['SFProDisplayRegular']`}>
                  Достижения
                </Text>
              </View>



        {/* Menu Items */}
        <View className="mb-4 grid grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AchievementsScreen;