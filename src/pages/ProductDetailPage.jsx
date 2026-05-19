import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  ShieldOff,
  ShoppingCart,
} from 'lucide-react'
import { getService, getServices } from '../api/catalogApi'
import { ResourceState } from '../components/ResourceState'
import { siteText } from '../content/siteText'
import { useCart } from '../context/CartContext'
import { cn } from '../lib/utils'
import { resolveMediaUrl } from '../utils/media'

const DURATION_OPTIONS = [1, 3, 6, 12]
const SIMILAR_LIMIT = 6

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
  return product && product.available !== false
}

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const text = siteText.pages.productDetail
  const productsText = siteText.pages.products

  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [duration, setDuration] = useState(1)
  const [feedback, setFeedback] = useState(null)
  const [similar, setSimilar] = useState([])
  const [isSimilarLoading, setIsSimilarLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(false)
    setFeedback(null)
    setProduct(null)
    getService(id)
      .then((data) => {
        if (!cancelled) setProduct(data)
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
  }, [id])

  useEffect(() => {
    if (!product?.category?.id) {
      setSimilar([])
      return
    }
    let cancelled = false
    setIsSimilarLoading(true)
    getServices({ categoryId: product.category.id, itemsPerPage: SIMILAR_LIMIT + 2 })
      .then((items) => {
        if (cancelled) return
        const filtered = items
          .filter((item) => String(item.id) !== String(product.id))
          .slice(0, SIMILAR_LIMIT)
        setSimilar(filtered)
      })
      .catch(() => {
        if (!cancelled) setSimilar([])
      })
      .finally(() => {
        if (!cancelled) setIsSimilarLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [product?.id, product?.category?.id])

  const available = isAvailable(product)

  const handleAddToCart = async () => {
    if (!product || !available) return
    setFeedback(null)
    try {
      await addItem(product, { quantity, durationMonths: duration })
      setFeedback({ kind: 'success', message: text.addedToCart })
    } catch (err) {
      setFeedback({
        kind: 'error',
        message: text.addError + (err?.message ? ` (${err.message})` : ''),
      })
    }
  }

  return (
    <div className="mx-auto w-full max-w-[var(--page-max-width)] px-4 py-8 lg:px-6 lg:py-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {text.back}
      </button>

      <ResourceState
        isLoading={isLoading}
        error={error}
        skeletonCount={1}
        loadingClassName="grid grid-cols-1 gap-6 lg:grid-cols-2"
        errorMessage={text.error}
      >
        {product ? (
          <>
            <article className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
              <figure className="relative overflow-hidden rounded-2xl border border-border bg-card">
                <img
                  src={resolveMediaUrl(product.image, product.name)}
                  alt={`Illustration de ${product.name}`}
                  loading="lazy"
                  className={cn(
                    'aspect-[4/3] w-full object-cover lg:aspect-[5/4]',
                    !available && 'opacity-70'
                  )}
                />
                {!available ? (
                  <span className="absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive backdrop-blur-sm">
                    <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
                    {text.unavailable}
                  </span>
                ) : null}
              </figure>

              <div className="flex flex-col">
                <span className="inline-flex w-fit items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {product.category?.name ?? text.fallbackCategory}
                </span>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                  {product.name}
                </h1>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground lg:text-lg">
                  {product.description}
                </p>

                <div className="mt-6 flex items-baseline gap-3">
                  <div className="font-mono text-3xl font-semibold tracking-tight tabular-nums text-primary lg:text-4xl">
                    {formatPrice(product.price)}
                  </div>
                  {available ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Disponible
                    </span>
                  ) : null}
                </div>

                {available ? (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="quantity"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {text.quantityLabel}
                      </label>
                      <div className="inline-flex h-10 items-center rounded-lg border border-border bg-background">
                        <button
                          type="button"
                          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                          aria-label="Diminuer la quantité"
                          className="inline-flex h-full w-10 items-center justify-center rounded-s-lg text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <input
                          id="quantity"
                          type="number"
                          min={1}
                          value={quantity}
                          onChange={(event) =>
                            setQuantity(Math.max(1, Number(event.target.value) || 1))
                          }
                          className="h-full w-16 border-x border-border bg-transparent text-center font-mono text-sm tabular-nums text-foreground focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity((current) => current + 1)}
                          aria-label="Augmenter la quantité"
                          className="inline-flex h-full w-10 items-center justify-center rounded-e-lg text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="duration"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {text.durationLabel}
                      </label>
                      <select
                        id="duration"
                        value={duration}
                        onChange={(event) => setDuration(Number(event.target.value) || 1)}
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
                      >
                        {DURATION_OPTIONS.map((value) => (
                          <option key={value} value={value}>
                            {value} {value === 1 ? text.month : text.months}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : null}

                <div className="mt-8 flex flex-wrap gap-3">
                  {available ? (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                      {text.addToCart}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-muted px-5 text-sm font-medium text-muted-foreground"
                    >
                      <ShieldOff className="h-4 w-4" aria-hidden="true" />
                      {text.unavailable}
                    </button>
                  )}
                  <Link
                    to="/products"
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-transparent px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {text.continue}
                  </Link>
                </div>

                {!available ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {text.unavailableHint}
                  </p>
                ) : null}

                {feedback ? (
                  <div
                    role={feedback.kind === 'error' ? 'alert' : 'status'}
                    className={cn(
                      'mt-6 rounded-lg border px-4 py-3 text-sm',
                      feedback.kind === 'success' &&
                        'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
                      feedback.kind === 'error' &&
                        'border-destructive/30 bg-destructive/10 text-destructive'
                    )}
                  >
                    {feedback.kind === 'success' ? (
                      <span className="inline-flex items-center gap-2">
                        <Check className="h-4 w-4" aria-hidden="true" />
                        {feedback.message}
                      </span>
                    ) : (
                      feedback.message
                    )}
                  </div>
                ) : null}
              </div>
            </article>

            <section className="mt-16 lg:mt-20" aria-labelledby="similar-title">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {product.category?.name ?? text.fallbackCategory}
                  </span>
                  <h2
                    id="similar-title"
                    className="mt-3 text-2xl font-semibold tracking-tight text-foreground lg:text-3xl"
                  >
                    {text.similarTitle}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground lg:text-base">
                    {text.similarSubtitle}
                  </p>
                </div>
              </div>

              {isSimilarLoading ? (
                <div
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
                  role="status"
                  aria-live="polite"
                >
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-60 overflow-hidden rounded-2xl border border-border bg-card motion-safe:animate-pulse"
                    />
                  ))}
                </div>
              ) : similar.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
                  {text.similarEmpty}
                </p>
              ) : (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                  {similar.map((item) => {
                    const itemAvailable = isAvailable(item)
                    return (
                      <li key={item.id ?? item.slug}>
                        <Link
                          to={`/products/${item.id}`}
                          className={cn(
                            'group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                            !itemAvailable && 'opacity-60'
                          )}
                        >
                          <figure className="relative aspect-[4/3] overflow-hidden bg-background">
                            <img
                              src={resolveMediaUrl(item.image, item.name)}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
                            />
                            {!itemAvailable ? (
                              <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/15 px-2.5 py-1 text-xs font-semibold text-destructive backdrop-blur-sm">
                                <ShieldOff className="h-3 w-3" aria-hidden="true" />
                                {productsText.unavailableLabel}
                              </span>
                            ) : null}
                          </figure>
                          <div className="flex flex-1 flex-col p-5">
                            <h3 className="line-clamp-2 text-base font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
                              {item.name}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                              {item.description}
                            </p>
                            <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                              <div className="font-mono text-base font-semibold tracking-tight tabular-nums text-primary">
                                {formatPrice(item.price)}
                              </div>
                              <ArrowRight
                                className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary"
                                aria-hidden="true"
                              />
                            </div>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </>
        ) : null}
      </ResourceState>
    </div>
  )
}
