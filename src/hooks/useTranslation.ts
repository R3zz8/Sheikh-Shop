'use client';

import { useMemo } from 'react';
import { translations, type Translations } from '@/lib/i18n/translations';
import { type Locale } from '@/lib/i18n/config';

export function useTranslation(locale: Locale = 'en') {
  const t = useMemo(() => translations[locale], [locale]);

  return {
    t,
    locale,
  };
}

// Utility function to get nested translation values
export function getNestedTranslation(
  translations: Translations,
  key: string
): string {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// Hook for getting specific translation values
export function useT(locale: Locale = 'en') {
  const { t } = useTranslation(locale);
  
  return (key: string) => getNestedTranslation(t, key);
}


