import { useFonts } from 'expo-font';

export function useFontLoader() {
  const [loaded] = useFonts({
    'SpaceGrotesk_400Regular': require('@expo-google-fonts/space-grotesk/SpaceGrotesk_400Regular.ttf'),
    'SpaceGrotesk_500Medium': require('@expo-google-fonts/space-grotesk/SpaceGrotesk_500Medium.ttf'),
    'SpaceGrotesk_600SemiBold': require('@expo-google-fonts/space-grotesk/SpaceGrotesk_600SemiBold.ttf'),
    'SpaceGrotesk_700Bold': require('@expo-google-fonts/space-grotesk/SpaceGrotesk_700Bold.ttf'),
    'Inter_400Regular': require('@expo-google-fonts/inter/Inter_400Regular.ttf'),
    'Inter_500Medium': require('@expo-google-fonts/inter/Inter_500Medium.ttf'),
    'Inter_600SemiBold': require('@expo-google-fonts/inter/Inter_600SemiBold.ttf'),
    'Inter_700Bold': require('@expo-google-fonts/inter/Inter_700Bold.ttf'),
  });

  return { fontsLoaded: loaded };
}
