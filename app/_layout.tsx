import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { ThemeProvider } from '../lib/theme';
import { useFontLoader } from '../lib/theme/fonts';
import { OnboardingModal } from '../components/OnboardingModal';

function RootLayoutContent() {
  const router = useRouter();
  const segments = useSegments();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { fontsLoaded } = useFontLoader();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)/map');
    }
  }, [session, segments, loading, fontsLoaded, router]);

  useEffect(() => {
    if (loading || !fontsLoaded || !session) return;

    AsyncStorage.getItem('hasSeenOnboarding').then((value) => {
      if (value !== 'true') {
        setShowOnboarding(true);
      }
    });
  }, [loading, fontsLoaded, session]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
  };

  if (loading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#E76F51" />
        <Text style={{ marginTop: 16, color: '#6C757D', fontSize: 14 }}>Carregant app...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
      <OnboardingModal visible={showOnboarding} onComplete={handleOnboardingComplete} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}