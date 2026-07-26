import { useState, useCallback } from 'react';
import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ca from '../locales/ca.json';
import es from '../locales/es.json';

const i18n = new I18n({
  ca,
  es,
});

i18n.defaultLocale = 'ca';
i18n.enableFallback = true;

i18n.locale = 'ca';

const LOCALE_KEY = 'app_locale';

// Load persisted locale on startup
AsyncStorage.getItem(LOCALE_KEY).then((saved) => {
  if (saved && (saved === 'ca' || saved === 'es')) {
    i18n.locale = saved;
  }
});

// Singleton listeners for locale changes
let localeListeners: Array<() => void> = [];
function notifyListeners() {
  for (const fn of localeListeners) fn();
}

export function useTranslation() {
  const [, setTick] = useState(0);

  const locale = i18n.locale;

  const setLocale = useCallback((newLocale: string) => {
    i18n.locale = newLocale;
    AsyncStorage.setItem(LOCALE_KEY, newLocale);
    notifyListeners();
  }, []);

  // Subscribe to locale changes from other components
  useState(() => {
    const listener = () => setTick((t) => t + 1);
    localeListeners.push(listener);
    return () => {
      localeListeners = localeListeners.filter((fn) => fn !== listener);
    };
  });

  const t = useCallback((key: string, options?: Record<string, any>): string => {
    return i18n.t(key, options);
  }, [locale]);

  return { t, locale, setLocale };
}
