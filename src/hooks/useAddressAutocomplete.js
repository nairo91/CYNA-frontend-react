import { useCallback, useEffect, useRef, useState } from 'react'
import { searchAddresses } from '../api/geoApi'

/**
 * Hook d'autocomplétion d'adresse.
 * Appelle GET /api/geo/address après un délai de 300 ms pour éviter le spam.
 *
 * @param {number} debounceMs  Délai avant d'envoyer la requête (défaut 300 ms)
 */
export function useAddressAutocomplete(debounceMs = 300) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const timerRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    // Annule le timer précédent
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      // Annule l'éventuelle requête en cours
      if (abortRef.current) abortRef.current = false

      const requestId = {}
      abortRef.current = requestId

      setIsLoading(true)
      try {
        const results = await searchAddresses(query)
        if (abortRef.current !== requestId) return // réponse obsolète
        setSuggestions(results)
        setIsOpen(results.length > 0)
      } catch {
        setSuggestions([])
        setIsOpen(false)
      } finally {
        setIsLoading(false)
      }
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, debounceMs])

  const clear = useCallback(() => {
    setSuggestions([])
    setIsOpen(false)
    setQuery('')
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  return { query, setQuery, suggestions, isLoading, isOpen, close, clear }
}
