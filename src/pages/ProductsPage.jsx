import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ShieldOff } from 'lucide-react'
import { getCategories, searchCatalog } from '../api/catalogApi'
import { ResourceState } from '../components/ResourceState'
import { siteText } from '../content/siteText'
import { cn } from '../lib/utils'
import { resolveMediaUrl } from '../utils/media'

const PAGE_SIZE = 12
const DEBOUNCE_MS = 300

const SORT_OPTIONS = [
  { value: 'priority:desc', sort: 'priority', direction: 'desc', labelKey: 'sortPriority' },
  { value: 'price:asc', sort: 'price', direction: 'asc', labelKey: 'sortPriceAsc' },
  { value: 'price:desc', sort: 'price', direction: 'desc', labelKey: 'sortPriceDesc' },
  { value: 'name:asc', sort: 'name', direction: 'asc', labelKey: 'sortNameAsc' },
]

const DEFAULT_DRAFT = {
  q: '',
  category: '',
  sortValue: 'priority:desc',
  minPrice: '',
  maxPrice: '',
  availableOnly: false,
}

function formatPrice(price) {
  if (price === null || price === undefined || price === '') {
    return siteText.pages.products.fallbackPrice
  }
  const numeric = Number(price)
  if (Number.isNaN(numeric)) return price
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(numeric)
}

function isAvailable(product) {
  return product.available !== false
}

export function ProductsPage() {
  const page = siteText.pages.products
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const sortValue = searchParams.get('sort') ?? 'priority:desc'
  const minPrice = searchParams.get('minPrice') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''
  const availableOnly = searchParams.get('available') === '1'
  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1)
  const offset = (currentPage - 1) * PAGE_SIZE

  const [categories, setCategories] = useState([])
  const [results, setResults] = useState({ items: [], total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [draft, setDraft] = useState({
    q,
    category,
    sortValue,
    minPrice,
    maxPrice,
    availableOnly,
  })

  const isInitialMount = useRef(true)

  useEffect(() => {
    let cancelled = false
    getCategories()
      .then((data) => {
        if (!cancelled) setCategories(data)
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setDraft({ q, category, sortValue, minPrice, maxPrice, availableOnly })
  }, [q, category, sortValue, minPrice, maxPrice, availableOnly])

  const commitDraft = (overrides = {}) => {
    const next = new URLSearchParams()
    const final = { ...draft, ...overrides }
    if (final.q) next.set('q', final.q)
    if (final.category) next.set('category', final.category)
    if (final.sortValue && final.sortValue !== 'priority:desc') next.set('sort', final.sortValue)
    if (final.minPrice) next.set('minPrice', final.minPrice)
    if (final.maxPrice) next.set('maxPrice', final.maxPrice)
    if (final.availableOnly) next.set('available', '1')
    setSearchParams(next)
  }

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const draftMatchesUrl =
      draft.q === q &&
      draft.category === category &&
      draft.sortValue === sortValue &&
      draft.minPrice === minPrice &&
      draft.maxPrice === maxPrice &&
      draft.availableOnly === availableOnly
    if (draftMatchesUrl) return
    const timer = window.setTimeout(() => commitDraft(), DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(false)
    const sortOption =
      SORT_OPTIONS.find((opt) => opt.value === sortValue) ?? SORT_OPTIONS[0]
    searchCatalog({
      q: q || undefined,
      category: category || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      availableOnly: availableOnly || undefined,
      sort: sortOption.sort,
      direction: sortOption.direction,
      limit: PAGE_SIZE,
      offset,
    })
      .then((payload) => {
        if (cancelled) return
        const rawItems = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
          ? payload
          : []
        const total =
          typeof payload?.total === 'number' ? payload.total : rawItems.length
        const sorted = [...rawItems].sort((a, b) => {
          const aAvail = isAvailable(a) ? 0 : 1
          const bAvail = isAvailable(b) ? 0 : 1
          return aAvail - bAvail
        })
        setResults({ items: sorted, total })
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [q, category, sortValue, minPrice, maxPrice, availableOnly, offset])

  const totalPages = Math.max(1, Math.ceil(results.total / PAGE_SIZE))

  const handleSubmit = (event) => {
    event.preventDefault()
    commitDraft()
  }

  const handleReset = () => {
    setDraft(DEFAULT_DRAFT)
    setSearchParams(new URLSearchParams())
  }

  const goToPage = (target) => {
    const next = new URLSearchParams(searchParams)
    if (target <= 1) next.delete('page')
    else next.set('page', String(target))
    setSearchParams(next)
  }

  const pageInfo = useMemo(
    () => page.pageInfo.replace('{current}', currentPage).replace('{total}', totalPages),
    [page.pageInfo, currentPage, totalPages]
  )

  const resultsCount = useMemo(() => {
    const tpl = results.total > 1 ? page.resultsCountPlural : page.resultsCountSingular
    return tpl.replace('{total}', String(results.total))
  }, [results.total, page.resultsCountPlural, page.resultsCountSingular])

  return (
    <div className="mx-auto w-full max-w-[var(--page-max-width)] px-4 py-12 lg:px-6 lg:py-16">
      <header className="mb-10 lg:mb-12">
        <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {page.eyebrow}
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground lg:text-5xl">
          {page.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground lg:text-lg">
          {page.copy}
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        aria-label={page.filtersHeading}
        className="mb-8 rounded-2xl border border-border bg-card p-4 lg:p-6"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1.2fr_1.2fr_repeat(2,minmax(0,7rem))]">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {page.searchLabel}
            </span>
            <input
              type="search"
              value={draft.q}
              onChange={(event) => setDraft((current) => ({ ...current, q: event.target.value }))}
              placeholder={page.searchPlaceholder}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {page.categoryLabel}
            </span>
            <select
              value={draft.category}
              onChange={(event) =>
                setDraft((current) => ({ ...current, category: event.target.value }))
              }
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              <option value="">{page.categoryAll}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {page.sortLabel}
            </span>
            <select
              value={draft.sortValue}
              onChange={(event) =>
                setDraft((current) => ({ ...current, sortValue: event.target.value }))
              }
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {page[opt.labelKey]}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {page.minPriceLabel}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.minPrice}
              onChange={(event) =>
                setDraft((current) => ({ ...current, minPrice: event.target.value }))
              }
              placeholder={page.pricePlaceholderMin}
              className="h-10 rounded-lg border border-border bg-background px-3 font-mono text-sm tabular-nums text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {page.maxPriceLabel}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={draft.maxPrice}
              onChange={(event) =>
                setDraft((current) => ({ ...current, maxPrice: event.target.value }))
              }
              placeholder={page.pricePlaceholderMax}
              className="h-10 rounded-lg border border-border bg-background px-3 font-mono text-sm tabular-nums text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <label className="inline-flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={draft.availableOnly}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  availableOnly: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {page.availableOnlyLabel}
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              {page.reset}
            </button>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              {page.submit}
            </button>
          </div>
        </div>
      </form>

      {!isLoading && !error ? (
        <p className="mb-6 text-sm text-muted-foreground" aria-live="polite">
          <span className="font-mono tabular-nums">{resultsCount}</span>
        </p>
      ) : null}

      <ResourceState
        isLoading={isLoading}
        error={error}
        skeletonCount={PAGE_SIZE}
        loadingClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
        errorMessage={page.error}
      >
        {results.items.length === 0 ? (
          <div
            role="status"
            className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground"
          >
            {page.empty}
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {results.items.map((product) => {
                const available = isAvailable(product)
                return (
                  <li key={product.id ?? product.slug}>
                    <Link
                      to={`/products/${product.id}`}
                      aria-label={`${product.name}${available ? '' : `, ${page.unavailableLabel}`}`}
                      className={cn(
                        'group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        !available && 'opacity-60 hover:opacity-80'
                      )}
                    >
                      <figure className="relative aspect-[4/3] overflow-hidden bg-background">
                        <img
                          src={resolveMediaUrl(product.image, product.name)}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
                        />
                        <span className="absolute start-3 top-3 inline-flex items-center rounded-full border border-border bg-card/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                          {product.category?.name ?? page.fallbackCategory}
                        </span>
                        {!available ? (
                          <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/15 px-2.5 py-1 text-xs font-semibold text-destructive backdrop-blur-sm">
                            <ShieldOff className="h-3 w-3" aria-hidden="true" />
                            {page.unavailableLabel}
                          </span>
                        ) : null}
                      </figure>
                      <div className="flex flex-1 flex-col p-5">
                        <h2 className="line-clamp-2 text-base font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
                          {product.name}
                        </h2>
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {product.description}
                        </p>
                        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                          <div className="font-mono text-lg font-semibold tracking-tight tabular-nums text-primary">
                            {formatPrice(product.price)}
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">
                            {page.detail}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {totalPages > 1 ? (
              <nav
                aria-label="Pagination"
                className="mt-10 flex flex-wrap items-center justify-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  {page.previous}
                </button>
                <span className="px-2 font-mono text-sm tabular-nums text-muted-foreground">
                  {pageInfo}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {page.next}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </nav>
            ) : null}
          </>
        )}
      </ResourceState>
    </div>
  )
}
