import { Link, useNavigate } from 'react-router-dom'
import { siteText } from '../content/siteText'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { resolveMediaUrl } from '../utils/media'

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
  const { items, subtotal, isLoading, updateQuantity, removeItem } = useCart()

  if (isLoading) {
    return <section className="section"><div className="container"><div className="app-loading">{text.loading}</div></div></section>
  }

  if (items.length === 0) {
    return (
      <section className="section">
        <div className="container">
          <div className="placeholder-card panel">
            <span className="eyebrow">{text.eyebrow}</span>
            <h1 className="section-title">{text.emptyTitle}</h1>
            <p className="section-copy">{text.emptyCopy}</p>
            <div className="hero-actions">
              <Link className="button-primary" to="/products">{text.browseCatalog}</Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
      return
    }
    navigate('/checkout')
  }

  return (
    <section className="section">
      <div className="container">
        <header className="section-heading">
          <span className="eyebrow">{text.eyebrow}</span>
          <h1 className="section-title">{text.title}</h1>
          <p className="section-copy">{text.copy}</p>
        </header>

        <div className="cart-list">
          {items.map((it) => {
            const lineKey = it.id ?? it.productId
            const linePrice = Number(it.price) * (it.quantity ?? 0) * (it.durationMonths ?? 1)
            return (
              <article className="cart-line panel" key={lineKey}>
                <div className="cart-line-media">
                  <img src={resolveMediaUrl(it.image, it.name)} alt="" loading="lazy" />
                </div>
                <div className="cart-line-body">
                  <strong>{it.name}</strong>
                  <p className="section-copy">{text.duration}: {it.durationMonths} {it.durationMonths > 1 ? text.months : text.month}</p>
                  <p className="cart-line-price">{formatPrice(it.price)}</p>
                </div>
                <div className="cart-line-controls">
                  <label className="auth-field">
                    <span>{text.quantity}</span>
                    <input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) => updateQuantity(lineKey, Number(e.target.value) || 1)}
                    />
                  </label>
                  <div className="cart-line-total">{formatPrice(linePrice)}</div>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => removeItem(lineKey)}
                  >
                    {text.remove}
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        <aside className="cart-summary panel">
          <div className="cart-summary-row">
            <span>{text.subtotal}</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <p className="section-copy">{text.taxesNote}</p>
          <button type="button" className="button-primary" onClick={handleCheckout}>
            {text.checkout}
          </button>
          {!isAuthenticated ? (
            <p className="auth-feedback auth-feedback-info">{text.loginNeeded}</p>
          ) : null}
        </aside>
      </div>
    </section>
  )
}
