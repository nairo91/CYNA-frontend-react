import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'cyna_ios_install_banner_dismissed'

function canShowIosInstallPrompt() {
  if (typeof window === 'undefined') return false

  const userAgent = window.navigator.userAgent ?? ''
  const isIos = /iPhone|iPad/i.test(userAgent)
  const isStandalone = window.navigator.standalone === true
  const isDismissed = window.localStorage.getItem(STORAGE_KEY) === 'true'

  return isIos && !isStandalone && !isDismissed
}

export function useIosInstallPrompt() {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    setShouldShow(canShowIosInstallPrompt())
  }, [])

  const dismiss = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'true')
    }
    setShouldShow(false)
  }, [])

  return { shouldShow, dismiss }
}
