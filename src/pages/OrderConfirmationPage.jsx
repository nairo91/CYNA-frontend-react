import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrder } from '../api/orderApi'
import { siteText } from '../content/siteText'

function formatPrice(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(numeric)
}

export function OrderConfirmationPage() {
  const { id } = useParams()
  const text = siteText.pages.orderConfirmation
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    getOrder(id)
      .then((data) => { if (!cancelled) setOrder(data) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (isLoading) {
    return <section className="section"><div className="container"><div className="app-loading">{text.loading}</div></div></section>
  }

  if (error || !order) {
    return (
      <section className="section">
        <div className="container">
          <div className="placeholder-card panel">
            <h1 className="section-title">{text.errorTitle}</h1>
            <p className="section-copy">{text.errorCopy}</p>
            <div className="hero-actions">
              <Link className="button-primary" to="/espace-client">{text.backToAccount}</Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <div className="placeholder-card panel">
          <span className="eyebrow">{text.eyebrow}</span>
          <h1 className="section-title">{text.title}</h1>
          <p className="section-copy">{text.copy.replace('{ref}', order.reference ?? `#${order.id}`)}</p>

          <dl className="account-identity-grid">
            <div><dt>{text.reference}</dt><dd>{order.reference ?? `#${order.id}`}</dd></div>
            <div><dt>{text.total}</dt><dd>{formatPrice(order.totalPrice)}</dd></div>
            <div><dt>{text.status}</dt><dd>{order.status}</dd></div>
          </dl>

          <div className="hero-actions">
            <Link className="button-primary" to="/espace-client">{text.backToAccount}</Link>
            <Link className="button-secondary" to="/products">{text.continue}</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
