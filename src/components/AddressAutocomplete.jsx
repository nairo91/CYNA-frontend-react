/* eslint-disable react/prop-types */
import { useEffect, useId, useRef, useState } from 'react'
import { Loader2, MapPin, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { searchAddresses, toAddressFields } from '../api/geoApi'
import { cn } from '../lib/utils'

const DEBOUNCE_MS = 250

const INPUT_CLASSES =
  'h-10 w-full min-w-0 rounded-lg border border-border bg-background ps-10 pe-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40'

/**
 * Champ d'autocompletion d'adresse base sur l'API BAN (Base Adresse Nationale)
 * proxifiee par le backend Symfony (endpoint /api/geo/address).
 *
 * Pattern combobox ARIA :
 *   - role="combobox", aria-expanded, aria-controls
 *   - Suggestions en role="listbox" avec aria-activedescendant
 *   - Navigation au clavier (Arrow Up/Down, Enter, Escape)
 *
 * @param {object}   props
 * @param {string}   props.value         Texte affiche dans l'input
 * @param {Function} props.onChange      (text) => void quand l'utilisateur tape
 * @param {Function} props.onSelect      (addressFields) => void quand une suggestion est choisie
 *                                       addressFields = { line1, postalCode, city, region, country, label }
 * @param {string}   [props.label]       Texte du label visible
 * @param {string}   [props.id]          Force un id (sinon useId)
 * @param {boolean}  [props.required]
 * @param {string}   [props.className]   Classe wrappers
 */
export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  label,
  id,
  required,
  className,
}) {
  const { t } = useTranslation('common')
  const autoId = useId()
  const inputId = id ?? `address-${autoId}`
  const listId = `${inputId}-list`

  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [error, setError] = useState(false)

  const requestId = useRef(0)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const trimmed = (value ?? '').trim()
    if (trimmed.length < 3) {
      setResults([])
      setIsLoading(false)
      setError(false)
      return undefined
    }

    const handle = window.setTimeout(async () => {
      const currentId = ++requestId.current
      setIsLoading(true)
      setError(false)
      try {
        const data = await searchAddresses(trimmed, { limit: 6 })
        if (requestId.current === currentId) {
          setResults(data)
          setActiveIndex(data.length > 0 ? 0 : -1)
        }
      } catch (err) {
        if (requestId.current === currentId) {
          setResults([])
          setError(true)
        }
      } finally {
        if (requestId.current === currentId) {
          setIsLoading(false)
        }
      }
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(handle)
  }, [value])

  useEffect(() => {
    if (!isOpen) return undefined
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleSelect = (result) => {
    const fields = toAddressFields(result)
    if (fields) {
      onSelect?.(fields)
    }
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setActiveIndex((current) => {
        if (results.length === 0) return -1
        return Math.min(current + 1, results.length - 1)
      })
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && results[activeIndex]) {
        event.preventDefault()
        handleSelect(results[activeIndex])
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  const handleClear = () => {
    onChange?.('')
    setResults([])
    setIsOpen(false)
    setActiveIndex(-1)
  }

  const showList =
    isOpen && (isLoading || error || results.length > 0 || (value ?? '').trim().length >= 3)

  return (
    <div ref={wrapperRef} className={cn('relative grid min-w-0 gap-1.5', className)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </label>
      ) : null}

      <div className="relative">
        <MapPin
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />

        <input
          id={inputId}
          type="text"
          autoComplete="street-address"
          value={value ?? ''}
          onChange={(event) => {
            onChange?.(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('addressAutocomplete.placeholder')}
          required={required}
          role="combobox"
          aria-expanded={showList}
          aria-autocomplete="list"
          aria-controls={showList ? listId : undefined}
          aria-activedescendant={
            activeIndex >= 0 && results[activeIndex]
              ? `${inputId}-opt-${activeIndex}`
              : undefined
          }
          className={INPUT_CLASSES}
        />

        {value ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label={t('addressAutocomplete.clear')}
            className="absolute end-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">{t('addressAutocomplete.hint')}</p>

      {showList ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('addressAutocomplete.listAriaLabel')}
          className="absolute inset-x-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
        >
          {isLoading ? (
            <li className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 motion-safe:animate-spin" aria-hidden="true" />
              {t('addressAutocomplete.loading')}
            </li>
          ) : error ? (
            <li className="px-3 py-2 text-sm text-destructive">
              {t('addressAutocomplete.error')}
            </li>
          ) : results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              {t('addressAutocomplete.noResults')}
            </li>
          ) : (
            results.map((result, index) => (
              <li
                key={`${result.label}-${index}`}
                id={`${inputId}-opt-${index}`}
                role="option"
                aria-selected={activeIndex === index}
                onMouseDown={(event) => {
                  event.preventDefault()
                  handleSelect(result)
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'cursor-pointer rounded-md px-3 py-2 text-sm transition-colors',
                  activeIndex === index
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <div className="font-medium text-foreground">{result.label}</div>
                {result.context ? (
                  <div className="mt-0.5 text-xs text-muted-foreground">{result.context}</div>
                ) : null}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}
