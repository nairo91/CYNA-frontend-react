import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'cyna_ios_install_banner_dismissed_v2'

function readDismissedState() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function persistDismissedState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    // Le masquage reste actif pour la session React si le stockage est indisponible.
  }
}

export function isIosDevice() {
  if (typeof window === 'undefined') return false

  const { maxTouchPoints = 0, userAgent = '', platform = '' } = window.navigator
  const isiPhoneOrIPad = /iPhone|iPad|iPod/i.test(userAgent)
  const isIPadDesktopMode = /MacIntel/i.test(platform) && maxTouchPoints > 1

  return isiPhoneOrIPad || isIPadDesktopMode
}

export function isRunningStandalone() {
  if (typeof window === 'undefined') return false

  const navigatorStandalone = window.navigator.standalone === true
  const standaloneQuery =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(display-mode: standalone)')
      : null
  const displayModeStandalone = standaloneQuery?.matches === true

  return navigatorStandalone || displayModeStandalone
}

function canShowIosInstallPrompt() {
  if (typeof window === 'undefined') return false

  return isIosDevice() && !isRunningStandalone() && !readDismissedState()
}

export function useIosInstallPrompt() {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    const refreshPromptState = () => {
      setShouldShow(canShowIosInstallPrompt())
    }

    refreshPromptState()
    window.addEventListener('pageshow', refreshPromptState)
    window.addEventListener('visibilitychange', refreshPromptState)

    return () => {
      window.removeEventListener('pageshow', refreshPromptState)
      window.removeEventListener('visibilitychange', refreshPromptState)
    }
  }, [])

  const dismiss = useCallback(() => {
    if (typeof window !== 'undefined') {
      persistDismissedState()
    }
    setShouldShow(false)
  }, [])

  return { shouldShow, dismiss }
}
