import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import frCommon from './locales/fr/common.json'
import frHome from './locales/fr/home.json'
import frCatalog from './locales/fr/catalog.json'
import frCart from './locales/fr/cart.json'
import frCheckout from './locales/fr/checkout.json'
import frAuth from './locales/fr/auth.json'
import frAccount from './locales/fr/account.json'
import frLegal from './locales/fr/legal.json'
import frContact from './locales/fr/contact.json'

import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enCatalog from './locales/en/catalog.json'
import enCart from './locales/en/cart.json'
import enCheckout from './locales/en/checkout.json'
import enAuth from './locales/en/auth.json'
import enAccount from './locales/en/account.json'
import enLegal from './locales/en/legal.json'
import enContact from './locales/en/contact.json'

export const SUPPORTED_LOCALES = ['fr', 'en']
export const DEFAULT_LOCALE = 'fr'
export const LOCALE_STORAGE_KEY = 'cyna-locale'

const NAMESPACES = [
  'common',
  'home',
  'catalog',
  'cart',
  'checkout',
  'auth',
  'account',
  'legal',
  'contact',
]

function detectInitialLocale() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (saved && SUPPORTED_LOCALES.includes(saved)) return saved
  } catch {
    /* localStorage disabled */
  }
  const navLang = (navigator?.language ?? '').slice(0, 2).toLowerCase()
  return SUPPORTED_LOCALES.includes(navLang) ? navLang : DEFAULT_LOCALE
}

const resources = {
  fr: {
    common: frCommon,
    home: frHome,
    catalog: frCatalog,
    cart: frCart,
    checkout: frCheckout,
    auth: frAuth,
    account: frAccount,
    legal: frLegal,
    contact: frContact,
  },
  en: {
    common: enCommon,
    home: enHome,
    catalog: enCatalog,
    cart: enCart,
    checkout: enCheckout,
    auth: enAuth,
    account: enAccount,
    legal: enLegal,
    contact: enContact,
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectInitialLocale(),
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: SUPPORTED_LOCALES,
  ns: NAMESPACES,
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
  returnNull: false,
})

export default i18n
