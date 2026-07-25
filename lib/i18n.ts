import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import ca from '../locales/ca.json';
import es from '../locales/es.json';

const i18n = new I18n({
  ca,
  es,
});

i18n.defaultLocale = 'ca';

const deviceLocale = getLocales()[0]?.languageCode;
i18n.locale = deviceLocale === 'es' ? 'es' : 'ca';

i18n.enableFallback = true;

export function useTranslation() {
  const t = (key: string, options?: Record<string, any>): string => {
    return i18n.t(key, options);
  };

  const locale = i18n.locale;

  const setLocale = (newLocale: string) => {
    i18n.locale = newLocale;
  };

  return { t, locale, setLocale };
}
