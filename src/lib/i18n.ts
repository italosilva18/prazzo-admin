import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import Portuguese (Brazil) translations
import ptBRCommon from '@/locales/pt-BR/common.json'
import ptBRAuth from '@/locales/pt-BR/auth.json'
import ptBRDashboard from '@/locales/pt-BR/dashboard.json'
import ptBRErrors from '@/locales/pt-BR/errors.json'

// Import English translations
import enCommon from '@/locales/en/common.json'
import enAuth from '@/locales/en/auth.json'
import enDashboard from '@/locales/en/dashboard.json'
import enErrors from '@/locales/en/errors.json'

// Import Spanish translations
import esCommon from '@/locales/es/common.json'
import esAuth from '@/locales/es/auth.json'
import esDashboard from '@/locales/es/dashboard.json'
import esErrors from '@/locales/es/errors.json'

export const defaultNS = 'common'
export const fallbackLng = 'pt-BR'

export const resources = {
  'pt-BR': {
    common: ptBRCommon,
    auth: ptBRAuth,
    dashboard: ptBRDashboard,
    errors: ptBRErrors,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    errors: enErrors,
  },
  es: {
    common: esCommon,
    auth: esAuth,
    dashboard: esDashboard,
    errors: esErrors,
  },
} as const

export const supportedLanguages = [
  { code: 'pt-BR', name: 'Portugues (Brasil)', flag: 'BR' },
  { code: 'en', name: 'English', flag: 'US' },
  { code: 'es', name: 'Espanol', flag: 'ES' },
] as const

export type SupportedLanguage = (typeof supportedLanguages)[number]['code']

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng,
    defaultNS,
    ns: ['common', 'auth', 'dashboard', 'errors'],

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'prazzo-admin-language',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // React specific options
    react: {
      useSuspense: true,
    },
  })

// Utility function to format dates according to locale
export const formatDateByLocale = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const locale = i18n.language === 'pt-BR' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US'

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }

  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj)
}

// Utility function to format numbers according to locale
export const formatNumberByLocale = (value: number, options?: Intl.NumberFormatOptions): string => {
  const locale = i18n.language === 'pt-BR' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US'
  return new Intl.NumberFormat(locale, options).format(value)
}

// Utility function to format currency according to locale
export const formatCurrencyByLocale = (value: number, currency = 'BRL'): string => {
  const locale = i18n.language === 'pt-BR' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}

// Utility function to change language and persist preference
export const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
  await i18n.changeLanguage(language)
  localStorage.setItem('prazzo-admin-language', language)
}

// Utility function to get current language
export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language as SupportedLanguage) || fallbackLng
}

export default i18n
