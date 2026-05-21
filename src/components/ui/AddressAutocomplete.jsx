import { useEffect, useRef, useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { useAddressAutocomplete } from '../../hooks/useAddressAutocomplete'
import { cn } from '../../lib/utils'

/**
 * Champ d'adresse avec autocomplétion (BAN — Base Adresse Nationale, DINUM).
 *
 * Quand l'utilisateur sélectionne une suggestion, les champs adresse1, zipCode,
 * city et region sont pré-remplis automatiquement via onSelect.
 *
 * @param {object}   props
 * @param {string}   props.label       Label du champ
 * @param {string}   props.value       Valeur courante du champ adresse1
 * @param {function} props.onChange    Callback(value: string) — frappe manuelle
 * @param {function} props.onSelect    Callback({ adresse1, zipCode, city, region }) — sélection suggestion
 * @param {boolean}  [props.required]
 * @param {string}   [props.className]
 * @param {string}   [props.placeholder]
 */
export function AddressAutocomplete({
  label,
  value,
  onChange,
  onSelect,
  required,
  className,
  placeholder = 'Ex : 8 rue de Rivoli, Paris',
}) {
  const { query, setQuery, suggestions, isLoading, isOpen, close } =
    useAddressAutocomplete(300)

  const [activeIndex, setActiveIndex] = useState(-1)
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  // Sync la query avec la prop value venant du parent
  useEffect(() => {
    if (value !== query) setQuery(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Ferme la liste si clic hors du composant
  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close()
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [close])

  function handleInputChange(e) {
    const val = e.target.value
    setQuery(val)
    onChange(val)
    setActiveIndex(-1)
  }

  function pickSuggestion(suggestion) {
    // Construit adresse1 : "housenumber street" ou juste le label si type != housenumber
    const adresse1 =
      suggestion.housenumber && suggestion.street
        ? `${suggestion.housenumber} ${suggestion.street}`
        : suggestion.street || suggestion.label

    // Extrait la région depuis le context : "75, Paris, Île-de-France" → "Île-de-France"
    const contextParts = (suggestion.context ?? '').split(',')
    const region = contextParts.length >= 3
      ? contextParts[contextParts.length - 1].trim()
      : contextParts[contextParts.length - 1]?.trim() ?? ''

    onSelect({
      adresse1,
      zipCode: suggestion.postcode ?? '',
      city: suggestion.city ?? '',
      region,
    })

    setQuery(adresse1)
    close()
    setActiveIndex(-1)
  }

  function handleKeyDown(e) {
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      pickSuggestion(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      close()
      setActiveIndex(-1)
    }
  }

  const listId = 'address-autocomplete-list'
  const inputId = 'address-autocomplete-input'

  return (
    <div ref={containerRef} className={cn('relative grid gap-1.5', className)}>
      {/* Label */}
      <label
        htmlFor={inputId}
        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          autoComplete="off"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          required={required}
          aria-required={required ? 'true' : undefined}
          aria-autocomplete="list"
          aria-controls={isOpen ? listId : undefined}
          aria-activedescendant={
            isOpen && activeIndex >= 0 ? `addr-opt-${activeIndex}` : undefined
          }
          aria-expanded={isOpen}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-border bg-background px-3 pe-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
        {/* Icône droite */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-muted-foreground"
        >
          {isLoading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <MapPin className="h-4 w-4 opacity-50" />
          }
        </span>
      </div>

      {/* Liste de suggestions */}
      {isOpen && suggestions.length > 0 ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Suggestions d'adresse"
          className="absolute top-full z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.label}-${i}`}
              id={`addr-opt-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault() // évite le blur avant le click
                pickSuggestion(s)
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn(
                'flex cursor-pointer items-start gap-2.5 px-3 py-2.5 text-sm transition-colors',
                i === activeIndex
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-accent'
              )}
            >
              <MapPin
                className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 opacity-50"
                aria-hidden="true"
              />
              <span>
                <span className="block font-medium leading-snug">{s.label}</span>
                {s.context ? (
                  <span className="block text-xs text-muted-foreground">{s.context}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
