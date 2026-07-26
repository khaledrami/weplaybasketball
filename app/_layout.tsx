import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
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
  const [authChecked, setAuthChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { fontsLoaded } = useFontLoader();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auth check with timeout safety
  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(session);
          setAuthChecked(true);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        if (isMounted) {
          setAuthChecked(true); // Don't block app on auth error
        }
      }
    };

    checkSession();

    // Safety timeout: force continue after 3 seconds regardless
    timerRef.current = setTimeout(() => {
      if (isMounted && !authChecked) {
        console.warn('Auth check timeout - forcing continue');
        setAuthChecked(true);
      }
    }, 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session);
        setAuthChecked(true);
      }
    });

    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      subscription.unsubscribe();
    };
  }, []);

  // Navigation routing
  useEffect(() => {
    if (!authChecked) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)/map');
    }
  }, [session, segments, authChecked, router]);

  // Onboarding check
  useEffect(() => {
    if (!authChecked || !session) return;

    AsyncStorage.getItem('hasSeenOnboarding').then((value) => {
      if (value !== 'true') {
        setShowOnboarding(true);
      }
    });
  }, [authChecked, session]);

  // Show minimal loading only during first auth check (max 3s)
  if (!authChecked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#E76F51" />
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
      <OnboardingModal visible={showOnboarding} onComplete={async () => {
        setShowOnboarding(false);
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      }} />
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
