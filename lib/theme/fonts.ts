import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useCallback } from 'react';

SplashScreen.preventAutoHideAsync();

export function useFontLoader() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const [loaded, error] = useFonts({
    'SpaceGrotesk_400Regular': require('@expo-google-fonts/space-grotesk/SpaceGrotesk_400Regular.ttf'),
    'SpaceGrotesk_500Medium': require('@expo-google-fonts/space-grotesk/SpaceGrotesk_500Medium.ttf'),
    'SpaceGrotesk_600SemiBold': require('@expo-google-fonts/space-grotesk/SpaceGrotesk_600SemiBold.ttf'),
    'SpaceGrotesk_700Bold': require('@expo-google-fonts/space-grotesk/SpaceGrotesk_700Bold.ttf'),
    'Inter_400Regular': require('@expo-google-fonts/inter/Inter_400Regular.ttf'),
    'Inter_500Medium': require('@expo-google-fonts/inter/Inter_500Medium.ttf'),
    'Inter_600SemiBold': require('@expo-google-fonts/inter/Inter_600SemiBold.ttf'),
    'Inter_700Bold': require('@expo-google-fonts/inter/Inter_700Bold.ttf'),
  });

  const hideSplash = useCallback(async () => {
    if (loaded || error) {
      setFontsLoaded(true);
      await SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    hideSplash();
  }, [hideSplash]);

  // Fallback: si després de 4 segons les fonts encara no han carregat, forçar continuïtat
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!fontsLoaded) {
        console.warn('Font loading timeout - forcing continue');
        setFontsLoaded(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  return { fontsLoaded };
}
