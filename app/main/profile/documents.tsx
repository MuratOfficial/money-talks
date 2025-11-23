import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useFinancialStore from '@/hooks/useStore';

const DocumentsScreen = () => {
  const router = useRouter();
  const { theme } = useFinancialStore();
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-black' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const cardBgColor = isDark ? 'bg-white/20' : 'bg-gray-100';
  const iconColor = isDark ? '#FFF' : '#11181C';

  const menuItems = [
    {
      id: 'license',
      title: 'Лицензионное соглашение',
      hasArrow: true,
      onPress: () => console.log('Лицензионное соглашение')
    },
    {
      id: 'payment',
      title: 'Онлайн оплата',
      hasArrow: true,
      onPress: () => console.log('Онлайн оплата')
    },
    {
      id: 'policy',
      title: 'Политика конфиденциальности',
      hasArrow: true,
      onPress: () => console.log('Политика конфиденциальности')
    }
    
  ];

  const MenuItem = ({ item }:{item:any}) => (
    <TouchableOpacity
      onPress={item.onPress}
      className={`${cardBgColor} rounded-2xl p-3.5 mb-3 flex-row items-center justify-between`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <Text className={`${textColor} text-sm font-['SFProDisplayRegular'] ml-3`}>
          {item.title}
        </Text>
      </View>
      
      {item.hasArrow && (
        <Ionicons name="chevron-forward" size={20} color={iconColor} />
      )}
      

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
                <Text className={`${textColor} text-center w-full text-lg font-semibold font-['SFProDisplayRegular']`}>
                  Документы
                </Text>
              </View>



        {/* Menu Items */}
        <View className="mb-8">
          {menuItems.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DocumentsScreen;