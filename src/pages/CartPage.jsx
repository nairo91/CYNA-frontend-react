import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { siteText } from '../content/siteText'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { cn } from '../lib/utils'
import { resolveMediaUrl } from '../utils/media'

const DURATION_OPTIONS = [1, 3, 6, 12]

function formatPrice(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(numeric)
}

export function CartPage() {
  const text = siteText.pages.cart
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { items, subtotal, isLoading, updateQuantity, updateDuration, removeItem } = useCart()

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[var(--page-max-width)] px-4 py-16 lg:px-6">
        <p className="text-center text-muted-foreground" role="status" aria-live="polite">
          {text.loading}
        </p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[var(--page-max-width)] px-4 py-16 lg:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="h-6 w-6" aria-hidden="true" />
          </div>
          <span className="mt-4 inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {text.eyebrow}
          </span>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            {text.emptyTitle}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{text.emptyCopy}</p>
          <Link
            to="/products"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {text.browseCatalog}
          </Link>
        </div>
      </div>
    )
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
      return
    }
    navigate('/checkout')
  }

  const itemsCount = items.reduce((sum, it) => sum + (it.quantity ?? 0), 0)
  const itemsCountLabel = (itemsCount > 1 ? text.itemsCountPlural : text.itemsCountSingular).replace(
    '{count}',
    String(itemsCount)
  )

  const hasUnavailable = items.some((it) => it.available === false)

  return (
    <div className="mx-auto w-full max-w-[var(--page-max-width)] px-4 py-12 lg:px-6 lg:py-16">
      <header className="mb-10">
        <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {text.eyebrow}
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
          {text.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground lg:text-lg">
          {text.copy}
        </p>
        <p className="mt-2 font-mono text-sm tabular-nums text-muted-foreground">
          {itemsCountLabel}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-10">
        <ul className="space-y-4">
          {items.map((it) => {
            const lineKey = it.id ?? it.productId
            const lineTotal = Number(it.price) * (it.quantity ?? 0) * (it.durationMonths ?? 1)
            const available = it.available !== false
            return (
              <li
                key={lineKey}
                className={cn(
                  'overflow-hidden rounded-2xl border border-border bg-card',
                  !available && 'border-destructive/40'
                )}
              >
                <article className="grid gap-4 p-4 sm:grid-cols-[6rem_1fr] sm:p-5 lg:gap-6 lg:p-6">
                  <div className="aspect-square overflow-hidden rounded-lg border border-border bg-background">
                    <img
                      src={resolveMediaUrl(it.image, it.name)}
                      alt=""
                      loading="lazy"
                      className={cn(
                        'h-full w-full object-cover',
                        !available && 'opacity-60'
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-semibold tracking-tight text-foreground">
                          {it.name}
                        </h2>
                        <p className="mt-1 font-mono text-sm tabular-nums text-muted-foreground">
                          {formatPrice(it.price)}
                          <span className="text-muted-foreground/70"> /unité/mois</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(lineKey)}
                        aria-label={`${text.remove} : ${it.name}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    {!available ? (
                      <div
                        role="alert"
                        className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                      >
                        <AlertTriangle
                          className="mt-0.5 h-4 w-4 flex-shrink-0"
                          aria-hidden="true"
                        />
                        <span>{text.alertUnavailable}</span>
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-end gap-4">
                      <div>
                        <label
                          htmlFor={`qty-${lineKey}`}
                          className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {text.quantity}
                        </label>
                        <div className="inline-flex h-9 items-center rounded-lg border border-border bg-background">
                          <button
                            type="button"
                            onClick={() => updateQuantity(lineKey, Math.max(1, (it.quantity ?? 1) - 1))}
                            disabled={!available || (it.quantity ?? 1) <= 1}
                            aria-label={text.quantityDecrease}
                            className="inline-flex h-full w-9 items-center justify-center rounded-s-lg text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Minus className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <input
                            id={`qty-${lineKey}`}
                            type="number"
                            min={1}
                            value={it.quantity ?? 1}
                            onChange={(event) =>
                              updateQuantity(lineKey, Number(event.target.value) || 1)
                            }
                            disabled={!available}
                            className="h-full w-14 border-x border-border bg-transparent text-center font-mono text-sm tabular-nums text-foreground focus:outline-none disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(lineKey, (it.quantity ?? 1) + 1)}
                            disabled={!available}
                            aria-label={text.quantityIncrease}
                            className="inline-flex h-full w-9 items-center justify-center rounded-e-lg text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor={`dur-${lineKey}`}
                          className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          {text.duration}
                        </label>
                        <select
                          id={`dur-${lineKey}`}
                          value={it.durationMonths ?? 1}
                          onChange={(event) =>
                            updateDuration(lineKey, Number(event.target.value) || 1)
                          }
                          disabled={!available}
                          className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
                        >
                          {DURATION_OPTIONS.map((value) => (
                            <option key={value} value={value}>
                              {value} {value === 1 ? text.month : text.months}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="ms-auto text-end">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Total ligne
                        </p>
                        <p className="font-mono text-lg font-semibold tabular-nums text-primary">
                          {formatPrice(lineTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {text.subtotal}
            </h2>
            <div className="mt-4 flex items-baseline justify-between gap-3 border-b border-border pb-4">
              <span className="text-sm text-muted-foreground">{text.subtotal}</span>
              <span className="font-mono text-2xl font-semibold tabular-nums text-primary">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              {text.taxesNote}
            </p>
            {hasUnavailable ? (
              <p className="mt-3 text-xs leading-relaxed text-destructive">
                {text.alertUnavailable}
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleCheckout}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              {text.checkout}
            </button>
            {!isAuthenticated ? (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {text.loginNeeded}
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  )
}
