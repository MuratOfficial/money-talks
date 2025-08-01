import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
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
    <View style={styles.container}>
      {/* Основной контент с padding снизу для навигации */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Нижняя навигация */}
      <View style={styles.bottomNav}>
        {navButtons.map((button) => (
          <TouchableOpacity
            key={button.route}
            style={styles.navItem}
            onPress={() => router.navigate(button.route)}
          >
            <Ionicons
              name={button.iconName}
              size={24}
              color={button.route.includes(activeRoute) ? '#66BB6A' : '#666'}
            />
            <Text style={[
              styles.navLabel,
              button.route.includes(activeRoute) && { color: '#66BB6A' }
            ]}>
              {button.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 70, // Добавляем отступ равный высоте навигации
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1D1F24',
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    height: 70, // Фиксированная высота навигации
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navLabel: {
    color: '#666',
    fontSize: 10,
    marginTop: 5,
  },
});