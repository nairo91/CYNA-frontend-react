import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from './index'

const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur'])

function dirFor(locale) {
  const base = (locale || '').slice(0, 2).toLowerCase()
  return RTL_LOCALES.has(base) ? 'rtl' : 'ltr'
}

export function useLocale() {
  const { i18n } = useTranslation()
  const locale = i18n.resolvedLanguage || i18n.language || 'fr'
  const dir = dirFor(locale)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('lang', locale)
    root.setAttribute('dir', dir)
  }, [locale, dir])

  const setLocale = useCallback(
    (next) => {
      if (!SUPPORTED_LOCALES.includes(next) || next === locale) return
      i18n.changeLanguage(next)
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, next)
      } catch {
        /* localStorage disabled */
      }
    },
    [i18n, locale]
  )

  return { locale, dir, setLocale, supported: SUPPORTED_LOCALES }
}
