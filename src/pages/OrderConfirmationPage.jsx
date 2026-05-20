import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getOrder } from '../api/orderApi'

export function OrderConfirmationPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation('checkout')
  const text = t('orderConfirmation', { returnObjects: true })

  const formatPrice = (value) => {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return '—'
    const locale = i18n.resolvedLanguage === 'en' ? 'en-GB' : 'fr-FR'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(numeric)
  }

  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    getOrder(id)
      .then((data) => {
        if (!cancelled) setOrder(data)
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

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center px-4 py-12">
        <div className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
          {text.loading}
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center px-4 py-12">
        <div className="w-full rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            {text.errorTitle}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text.errorCopy}</p>
          <Link
            to="/espace-client"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {text.backToAccount}
          </Link>
        </div>
      </div>
    )
  }

  const orderRef = order.reference ?? `#${order.id}`

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 lg:py-16">
      <div className="rounded-2xl border border-border bg-card p-6 text-center lg:p-10">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </div>
        <span className="mt-4 inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {text.eyebrow}
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {text.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground lg:text-base">
          {t('orderConfirmation.copy', { ref: orderRef })}
        </p>

        <dl className="mt-8 grid gap-3 text-start sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-background p-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {text.reference}
            </dt>
            <dd className="mt-1 font-mono text-base font-medium tabular-nums text-foreground">
              {orderRef}
            </dd>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {text.total}
            </dt>
            <dd className="mt-1 font-mono text-base font-semibold tabular-nums text-primary">
              {formatPrice(order.totalPrice)}
            </dd>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {text.status}
            </dt>
            <dd className="mt-1 text-base font-medium text-foreground">{order.status}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/espace-client"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {text.backToAccount}
          </Link>
          <Link
            to="/products"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-transparent px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {text.continue}
          </Link>
        </div>
      </div>
    </div>
  )
}
