import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  colors,
  gradients,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  animation,
  iconSizes,
  touchTarget,
  breakpoints,
  courtAccessColors,
  courtAccessColorsDark,
  matchStatusColors,
  matchStatusColorsDark,
  type ColorScheme,
  type ThemeMode,
} from './tokens';

interface ThemeContextType {
  mode: ThemeMode;
  resolvedMode: ColorScheme;
  colors: typeof colors.light;
  gradients: typeof gradients;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  zIndex: typeof zIndex;
  animation: typeof animation;
  iconSizes: typeof iconSizes;
  touchTarget: typeof touchTarget;
  breakpoints: typeof breakpoints;
  courtAccessColors: typeof courtAccessColors;
  matchStatusColors: typeof matchStatusColors;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>(null as any);

const THEME_MODE_KEY = 'theme_mode';

export function ThemeProvider({ children, defaultMode = 'light' }: { children: React.ReactNode; defaultMode?: ThemeMode }) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_MODE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
      }
      setLoaded(true);
    });
  }, []);

  const setMode = useMemo(
    () => (newMode: ThemeMode) => {
      setModeState(newMode);
      AsyncStorage.setItem(THEME_MODE_KEY, newMode);
    },
    []
  );

  const resolvedMode = useMemo<ColorScheme>(() => {
    if (mode === 'system') {
      return (systemColorScheme as ColorScheme) ?? 'light';
    }
    return mode as ColorScheme;
  }, [mode, systemColorScheme]);

  const themeColors = useMemo(() => colors[resolvedMode], [resolvedMode]);
  const courtColors = useMemo(() => (resolvedMode === 'dark' ? courtAccessColorsDark : courtAccessColors), [resolvedMode]);
  const matchColors = useMemo(() => (resolvedMode === 'dark' ? matchStatusColorsDark : matchStatusColors), [resolvedMode]);

  const value = useMemo(
    () => ({
      mode,
      resolvedMode,
      colors: themeColors,
      gradients,
      typography,
      spacing,
      borderRadius,
      shadows,
      zIndex,
      animation,
      iconSizes,
      touchTarget,
      breakpoints,
      courtAccessColors: courtColors,
      matchStatusColors: matchColors,
      setMode,
      toggleMode: () => setMode(mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light'),
    }),
    [mode, resolvedMode, themeColors, courtColors, matchColors, setMode]
  );

  if (!loaded) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}