import React, { useEffect } from 'react'; 
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Inter_900Black, useFonts } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import "../global.css"

import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    // "Inter": Inter_900Black,
    // ActorRegular:require('../assets/fonts/Actor-Regular.ttf'),
    SFProDisplayBold:require('../assets/fonts/SF-Pro-Display-Bold.otf'),
    SFProDisplayRegular:require('../assets/fonts/SF-Pro-Display-Regular.otf'),
    SFProDisplaySemiBold: require('../assets/fonts/SF-Pro-Display-Semibold.otf'),
    // InterSemiBold: require('../assets/fonts/InterSemiBold')
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
