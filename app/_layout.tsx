import React, { useEffect } from 'react'; 
import { Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import "../global.css"

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthGuard } from '@/components/AuthGuard';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
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

  if (!loaded) {
    return null;
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