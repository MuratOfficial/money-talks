import React, { useEffect } from 'react'; 
import { View, ActivityIndicator, AppState } from 'react-native';
import { Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import "../global.css"

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthGuard } from '@/components/AuthGuard';
import { useFinancialStore } from '@/hooks/useStore';
import { useSync } from '@/hooks/useSync';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, user } = useFinancialStore();
  const { syncToServer, isSyncing } = useSync();
  
  const [loaded] = useFonts({
    SFProDisplayBold: require('../assets/fonts/SF-Pro-Display-Bold.otf'),
    SFProDisplayRegular: require('../assets/fonts/SF-Pro-Display-Regular.otf'),
    SFProDisplaySemiBold: require('../assets/fonts/SF-Pro-Display-Semibold.otf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Синхронизация при сворачивании/разворачивании приложения
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' && isAuthenticated && user?.id) {
        // Отправляем данные перед сворачиванием
        console.log('App going to background, syncing data...');
        syncToServer();
      }
      
      if (nextAppState === 'active' && isAuthenticated && user?.id) {
        // Приложение стало активным
        console.log('App became active');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, user?.id]);

  // Показываем загрузку только при первичной синхронизации
  if (!loaded) {
    return null;
  }

  // Если идет первичная синхронизация после авторизации
  if (isSyncing && isAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center bg-[#000000]">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="main" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthGuard>
  );
}