import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCategories, searchCatalog } from '../api/catalogApi'
import { ResourceState } from '../components/ResourceState'
import { siteText } from '../content/siteText'
import { resolveMediaUrl } from '../utils/media'

const PAGE_SIZE = 12

const SORT_OPTIONS = [
  { value: 'priority:desc', sort: 'priority', direction: 'desc', labelKey: 'sortPriority' },
  { value: 'price:asc', sort: 'price', direction: 'asc', labelKey: 'sortPriceAsc' },
  { value: 'price:desc', sort: 'price', direction: 'desc', labelKey: 'sortPriceDesc' },
  { value: 'name:asc', sort: 'name', direction: 'asc', labelKey: 'sortNameAsc' },
]

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

export function ProductsPage() {
  const page = siteText.pages.products
  const [searchParams, setSearchParams] = useSearchParams()

  const [categories, setCategories] = useState([])
  const [results, setResults] = useState({ items: [], total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const sortValue = searchParams.get('sort') ?? 'priority:desc'
  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1)
  const offset = (currentPage - 1) * PAGE_SIZE

  const [draft, setDraft] = useState({ q, category, sortValue })
  useEffect(() => {
    setDraft({ q, category, sortValue })
  }, [q, category, sortValue])

  useEffect(() => {
    let cancelled = false
    getCategories()
      .then((data) => { if (!cancelled) setCategories(data) })
      .catch(() => { if (!cancelled) setCategories([]) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(false)
    const sortOption = SORT_OPTIONS.find((opt) => opt.value === sortValue) ?? SORT_OPTIONS[0]
    searchCatalog({
      q: q || undefined,
      category: category || undefined,
      sort: sortOption.sort,
      direction: sortOption.direction,
      limit: PAGE_SIZE,
      offset,
    })
      .then((payload) => {
        if (cancelled) return
        const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : []
        const total = typeof payload?.total === 'number' ? payload.total : items.length
        setResults({ items, total })
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [q, category, sortValue, offset])

  const totalPages = Math.max(1, Math.ceil(results.total / PAGE_SIZE))

  const handleSubmit = (event) => {
    event.preventDefault()
    const next = new URLSearchParams()
    if (draft.q) next.set('q', draft.q)
    if (draft.category) next.set('category', draft.category)
    if (draft.sortValue && draft.sortValue !== 'priority:desc') next.set('sort', draft.sortValue)
    setSearchParams(next)
  }

  const handleReset = () => {
    setDraft({ q: '', category: '', sortValue: 'priority:desc' })
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
    [page.pageInfo, currentPage, totalPages],
  )

  return (
    <section className="section">
      <div className="container">
        <header className="section-heading">
          <span className="eyebrow">{page.eyebrow}</span>
          <h1 className="section-title">{page.title}</h1>
          <p className="section-copy">{page.copy}</p>
        </header>

        <form className="catalog-filters" onSubmit={handleSubmit}>
          <label className="catalog-field">
            <span className="visually-hidden">{page.searchPlaceholder}</span>
            <input
              type="search"
              value={draft.q}
              onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
              placeholder={page.searchPlaceholder}
            />
          </label>

          <label className="catalog-field">
            <span className="visually-hidden">{page.categoryAll}</span>
            <select
              value={draft.category}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            >
              <option value="">{page.categoryAll}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </label>

          <label className="catalog-field">
            <span className="visually-hidden">{page.sortLabel}</span>
            <select
              value={draft.sortValue}
              onChange={(e) => setDraft((d) => ({ ...d, sortValue: e.target.value }))}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{page[opt.labelKey]}</option>
              ))}
            </select>
          </label>

          <button type="submit" className="button-primary">{page.submit}</button>
          <button type="button" className="button-secondary" onClick={handleReset}>{page.reset}</button>
        </form>

        <ResourceState
          isLoading={isLoading}
          error={error}
          skeletonCount={PAGE_SIZE}
          loadingClassName="loading-grid"
          errorMessage={page.error}
        >
          {results.items.length === 0 ? (
            <div className="empty-state" role="status">{page.empty}</div>
          ) : (
            <>
              <div className="product-grid">
                {results.items.map((product) => (
                  <article className="product-card" key={product.id ?? product.slug}>
                    <Link className="product-card-link" to={`/products/${product.id}`}>
                      <div className="product-media">
                        <img
                          src={resolveMediaUrl(product.image, product.name)}
                          alt={`Illustration du produit ${product.name}`}
                          loading="lazy"
                        />
                      </div>
                      <div className="product-body">
                        <div className="product-tag">
                          {product.category?.name ?? page.fallbackCategory}
                        </div>
                        <strong>{product.name}</strong>
                        <p className="section-copy product-copy">{product.description}</p>
                      </div>
                      <div className="product-footer-row">
                        <div className="product-price">{formatPrice(product.price)}</div>
                        <span className="product-status">{page.detail}</span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {totalPages > 1 ? (
                <div className="catalog-pagination">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >{page.previous}</button>
                  <span className="catalog-page-info">{pageInfo}</span>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >{page.next}</button>
                </div>
              ) : null}
            </>
          )}
        </ResourceState>
      </div>
    </section>
  )
}
