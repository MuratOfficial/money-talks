import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { ReactElement } from 'react';

type NavButton = {
  route: "/main" | '/main/finance' | '/main/lfp' | '/main/invest' | '/main/profile';
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
};

export default function RootLayout(): ReactElement {
  const router = useRouter();
  const segments = useSegments();
  const activeRoute = (segments[1] ? segments[1] : segments[0]) || "main";

  const navButtons: NavButton[] = [
    { route: '/main', iconName: 'home', label: 'Главная' },
    { route: '/main/finance', iconName: 'bar-chart-outline', label: 'Финансы' },
    { route: '/main/lfp', iconName: 'list-circle-outline', label: 'ЛФП' },
    { route: '/main/invest', iconName: 'pie-chart-outline', label: 'Инвестиции' },
    { route: '/main/profile', iconName: 'person-outline', label: 'Профиль' },
  ];

  return (
    <View className="flex-1">
      {/* Основной контент с padding снизу для навигации */}
      <View className="flex-1 pb-[70px]">
        <Slot />
      </View>

      {/* Нижняя навигация */}
      <View className="absolute bottom-0 left-0 right-0 flex-row bg-[#1D1F24] py-[15px] px-5 justify-around h-[70px]">
        {navButtons.map((button) => (
          <TouchableOpacity
            key={button.route}
            className="items-center flex-1"
            onPress={() => router.navigate(button.route)}
          >
            <Ionicons
              name={button.iconName}
              size={24}
              color={button.route.includes(activeRoute) ? '#66BB6A' : '#666'}
            />
            <Text className={`text-[10px] mt-[5px] ${
              button.route.includes(activeRoute) ? 'text-[#66BB6A]' : 'text-[#666]'
            }`}>
              {button.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}