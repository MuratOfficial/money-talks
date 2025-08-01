import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ConfirmationDrawer from '@/app/components/MiniDrawer';
import Drawer from '@/app/components/Drawer';

const ProfileScreen = () => {


  const [showDrawerTheme, setShowDrawerTheme] = useState(false);
  const [selectedSortTheme, setSelectedSortTheme] = useState('Темная');

  const handleSortSelectTheme = (value:any) => {
    setSelectedSortTheme(value);
    console.log('Selected sort:', value);
  };

  const [showDrawerCurrency, setShowDrawerCurrency] = useState(false);
  const [selectedSortCurrency, setSelectedSortCurrency] = useState('Тенге (₸)');

  const handleSortSelectCurrency = (value:any) => {
    setSelectedSortCurrency(value);
    console.log('Selected sort:', value);
  };

    const [showLogoutDrawer, setShowLogoutDrawer] = useState(false);
  const router = useRouter();
  const [faceIdEnabled, setFaceIdEnabled] = useState(true);



  const handleLogout = () => {
    console.log('Выход из аккаунта');
    // Логика выхода
  };

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
      onPress: () => router.replace('/main/profile/achievements')
    },
    {
      id: 'currency',
      title: 'Выбор валюты',
      icon: 'camera-outline',
      hasArrow: true,
      onPress: () => setShowDrawerCurrency(true)
    },
    {
      id: 'documents',
      title: 'Документы',
      icon: 'document-outline',
      hasArrow: true,
      onPress: () => router.replace('/main/profile/documents')
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
      onPress: () => setShowDrawerTheme(true)
    },
    {
      id: 'logout',
      title: 'Выйти из аккаунта',
      icon: 'exit-outline',
      hasArrow: true,
      onPress: () => setShowLogoutDrawer(true)
    }
  ];

  const MenuItem = ({ item }:{item:any}) => (
    <TouchableOpacity
      onPress={item.onPress}
      className="bg-white/20 rounded-xl p-3.5 mb-3 flex-row items-center justify-between"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <Ionicons name={item.icon} size={20} color="white" />
        <Text className="text-white text-sm font-['SFProDisplayRegular'] ml-3">
          {item.title}
        </Text>
      </View>
      
      {item.hasArrow && (
        <Ionicons name="chevron-forward" size={20} color="#FFF" />
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
        <Text className="text-white text-xl font-['SFProDisplayBold'] mt-3 mb-8">
          Профиль
        </Text>

        {/* Profile Info */}
        <View className="items-center mb-8">
          {/* Avatar */}
          <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-4">
            <Ionicons name="person" size={32} color="white" />
          </View>
          
          {/* Name */}
          <Text className="text-white text-lg font-['SFProDisplayRegular'] mb-2">
            Алия Курмангалиева
          </Text>
          
          {/* Edit Button */}
          <TouchableOpacity className="flex-row items-center" onPress={()=>router.replace('/main/profile/edit-profile')}>
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
        <Drawer 
            title='Выбор темы'
            visible={showDrawerTheme}
            onClose={() => setShowDrawerTheme(false)}
            onSelect={handleSortSelectTheme}
            selectedValue={selectedSortTheme}
            options={ ['Светлая', 'Темная']}
            
          />
          <Drawer 
            title='Выбор валюты'
            visible={showDrawerCurrency}
            onClose={() => setShowDrawerCurrency(false)}
            onSelect={handleSortSelectCurrency}
            selectedValue={selectedSortCurrency}
            options={ ['Доллар ($)', 'Евро (€)', 'Дирхам ( د. إ)', 'Тенге (₸)', 'Лира (₺)', 'Рубль (₽)']}
            
          />

        <ConfirmationDrawer
          visible={showLogoutDrawer}
          title="Выйти из аккаунта?"
          onClose={() => setShowLogoutDrawer(false)}
          onConfirm={handleLogout}
          onCancel={() => console.log('Отменено')}
          confirmText="Выйти"
          cancelText="Отмена"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;