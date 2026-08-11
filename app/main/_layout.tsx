import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { ReactElement } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useFinancialStore from '@/hooks/useStore';
import BiometricGate from '@/app/components/BiometricGate';

type NavButton = {
  route: "/main" | '/main/finance' | '/main/lfp' | '/main/invest' | '/main/profile';
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
};

/** Высота самой панели навигации, без системной зоны жестов/кнопок. */
const NAV_BAR_HEIGHT = 70;

export default function RootLayout(): ReactElement {
  const router = useRouter();
  const segments = useSegments();
  const { theme } = useFinancialStore();
  // Начиная с Android 15 (target API 35+) приложение рисует под системной
  // панелью навигации — она больше не «отъедает» место сама. Поэтому нижнюю
  // навигацию поднимаем на insets.bottom, иначе её кнопки оказываются под
  // системными. На устройствах с жестами inset меньше, чем с тремя кнопками.
  const insets = useSafeAreaInsets();
  // segments приводим к string[]: при включённых typedRoutes без сгенерированных
  // типов (.expo/types) тип сужается до кортежа и индекс [1] был бы ошибкой.
  const segs = segments as string[];
  const activeRoute = (segs[1] ?? segs[0]) || "main";
  
  const isDark = theme === 'dark';
  const navBgColor = isDark ? 'bg-[#1D1F24]' : 'bg-gray-100';
  const navInactiveColor = isDark ? '#666' : '#9CA3AF';

  const navButtons: NavButton[] = [
    { route: '/main', iconName: 'home', label: 'Главная' },
    { route: '/main/finance', iconName: 'bar-chart-outline', label: 'Финансы' },
    { route: '/main/lfp', iconName: 'list-circle-outline', label: 'ЛФП' },
    { route: '/main/invest', iconName: 'pie-chart-outline', label: 'Инвестиции' },
    { route: '/main/profile', iconName: 'person-outline', label: 'Профиль' },
  ];

  return (
    <BiometricGate>
    <View className="flex-1">
      {/* Основной контент с padding снизу для навигации */}
      <View className="flex-1" style={{ paddingBottom: NAV_BAR_HEIGHT + insets.bottom }}>
        <Slot />
      </View>

      {/* Нижняя навигация */}
      <View
        className={`absolute bottom-0 left-0 right-0 flex-row ${navBgColor} px-5 justify-around`}
        style={{
          height: NAV_BAR_HEIGHT + insets.bottom,
          paddingTop: 15,
          paddingBottom: 15 + insets.bottom,
        }}
      >
        {navButtons.map((button) => (
          <TouchableOpacity
            key={button.route}
            className="items-center flex-1"
            onPress={() => router.navigate(button.route)}
          >
            <Ionicons
              name={button.iconName}
              size={24}
              color={button.route.includes(activeRoute) ? '#4CAF50' : navInactiveColor}
            />
            <Text className={`text-[10px] mt-[5px] ${
              button.route.includes(activeRoute) ? 'text-[#4CAF50]' : (isDark ? 'text-[#666]' : 'text-gray-600')
            }`}>
              {button.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
    </BiometricGate>
  );
}