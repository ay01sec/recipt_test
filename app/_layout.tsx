import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { View, Text } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      setAppReady(true);
    }
  }, [fontsLoaded]);

  if (!appReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </ThemeProvider>
  );
}
