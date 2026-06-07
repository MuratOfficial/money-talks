import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, AppState } from 'react-native';
import { useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import "../global.css"

import { AuthGuard } from '@/components/AuthGuard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SyncStatusBanner } from '@/components/SyncStatusBanner';
import { useFinancialStore } from '@/hooks/useStore';
import { useSync } from '@/hooks/useSync';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, user } = useFinancialStore();
  const { syncToServer, isSyncing, syncError, clearSyncError, isOnline } = useSync();

  // Держим актуальную ссылку на syncToServer, чтобы подписка на AppState
  // не захватывала устаревшее замыкание со старыми данными стора
  const syncToServerRef = useRef(syncToServer);
  syncToServerRef.current = syncToServer;

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
        syncToServerRef.current();
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
    <ErrorBoundary>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="main" />
          <Stack.Screen name="+not-found" />
        </Stack>
        {!isOnline && (
          <SyncStatusBanner
            message="Нет подключения к интернету — изменения сохранены локально"
            onDismiss={() => {}}
            autoHideMs={0}
          />
        )}
        {isOnline && (
          <SyncStatusBanner message={syncError} onDismiss={clearSyncError} />
        )}
      </AuthGuard>
    </ErrorBoundary>
  );
}