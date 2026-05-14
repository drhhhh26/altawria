import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { View, ActivityIndicator, I18nManager, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { initDb } from '../db/database';
import { useSettings } from '../store/settingsStore';
import { Colors } from '../constants/theme';

// Force RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function RootLayout() {
  const { loaded, onboardingDone, loadSettings } = useSettings();

  useEffect(() => {
    async function bootstrap() {
      await initDb();
      await loadSettings();
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (!onboardingDone) {
      router.replace('/onboarding/welcome');
    }
  }, [loaded, onboardingDone]);

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding/welcome" />
        <Stack.Screen name="onboarding/license-quiz" />
        <Stack.Screen name="onboarding/ready" />
        <Stack.Screen name="study/session" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="exam/session" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="results" options={{ animation: 'fade' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
