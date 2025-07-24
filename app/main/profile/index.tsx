import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const ProfileScreen = () => {
  const router = useRouter();
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);

  const menuItems = [
    {
      id: 'tips',
      title: 'Советы',
      icon: 'library-outline',
      hasArrow: true,
      onPress: () => console.log('Советы pressed')
    },
    {
      id: 'achievements',
      title: 'Достижения',
      icon: 'diamond-outline',
      hasArrow: true,
      onPress: () => console.log('Достижения pressed')
    },
    {
      id: 'currency',
      title: 'Выбор валюты',
      icon: 'camera-outline',
      hasArrow: true,
      onPress: () => console.log('Выбор валюты pressed')
    },
    {
      id: 'documents',
      title: 'Документы',
      icon: 'document-outline',
      hasArrow: true,
      onPress: () => console.log('Документы pressed')
    },
    {
      id: 'faceid',
      title: 'Face ID',
      icon: 'finger-print-outline',
      hasSwitch: true,
      switchValue: faceIdEnabled,
      onSwitchChange: setFaceIdEnabled
    },
    {
      id: 'theme',
      title: 'Выбор темы',
      icon: 'phone-portrait-outline',
      hasArrow: true,
      onPress: () => console.log('Выбор темы pressed')
    },
    {
      id: 'logout',
      title: 'Выйти из аккаунта',
      icon: 'exit-outline',
      hasArrow: true,
      onPress: () => console.log('Выйти из аккаунта pressed')
    }
  ];

  const MenuItem = ({ item }:{item:any}) => (
    <TouchableOpacity
      onPress={item.onPress}
      className="bg-gray-800 rounded-xl px-4 py-4 mb-3 flex-row items-center justify-between"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <Ionicons name={item.icon} size={20} color="white" />
        <Text className="text-white text-base font-['SFProDisplayRegular'] ml-3">
          {item.title}
        </Text>
      </View>
      
      {item.hasArrow && (
        <Ionicons name="chevron-forward" size={20} color="#666" />
      )}
      
      {item.hasSwitch && (
        <Switch
          value={item.switchValue}
          onValueChange={item.onSwitchChange}
          trackColor={{ false: '#767577', true: '#4CAF50' }}
          thumbColor={item.switchValue ? '#ffffff' : '#f4f3f4'}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView 
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text className="text-white text-2xl font-['SFProDisplayBold'] mt-4 mb-8">
          Профиль
        </Text>

        {/* Profile Info */}
        <View className="items-center mb-8">
          {/* Avatar */}
          <View className="w-20 h-20 bg-gray-700 rounded-full items-center justify-center mb-4">
            <Ionicons name="person" size={32} color="white" />
          </View>
          
          {/* Name */}
          <Text className="text-white text-lg font-['SFProDisplayMedium'] mb-2">
            Алия Курмангалиева
          </Text>
          
          {/* Edit Button */}
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-[#4CAF50] text-base font-['SFProDisplayRegular'] mr-1">
              Редактировать
            </Text>
            <Ionicons name="pencil" size={16} color="#4CAF50" />
          </TouchableOpacity>
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

export default ProfileScreen;