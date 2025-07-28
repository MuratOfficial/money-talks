import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const DocumentsScreen = () => {
  const router = useRouter();
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);

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
      className="bg-white/20 rounded-2xl p-3.5 mb-3 flex-row items-center justify-between"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <Text className="text-white text-sm font-['SFProDisplayRegular'] ml-3">
          {item.title}
        </Text>
      </View>
      
      {item.hasArrow && (
        <Ionicons name="chevron-forward" size={20} color="#FFF" />
      )}
      

    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
         <View className="flex-row items-center  py-3 pb-6 w-full">
                <TouchableOpacity  onPress={()=>router.replace('/main/profile')}>
                   <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-center w-full text-lg font-semibold font-['SFProDisplayRegular']">
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