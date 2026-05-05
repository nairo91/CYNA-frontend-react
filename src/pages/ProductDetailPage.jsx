import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getService } from '../api/catalogApi'
import { ResourceState } from '../components/ResourceState'
import { siteText } from '../content/siteText'
import { useCart } from '../context/CartContext'
import { resolveMediaUrl } from '../utils/media'

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return 'Sur devis'
  const numeric = Number(price)
  if (Number.isNaN(numeric)) return price
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(numeric)
}

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const text = siteText.pages.productDetail

  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [duration, setDuration] = useState(1)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(false)
    getService(id)
      .then((data) => { if (!cancelled) setProduct(data) })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const handleAddToCart = async () => {
    if (!product) return
    setFeedback('')
    try {
      await addItem(product, { quantity, durationMonths: duration })
      setFeedback(text.addedToCart)
    } catch (err) {
      setFeedback(text.addError + (err?.message ? ` (${err.message})` : ''))
    }
  }

  return (
    <section className="section">
      <div className="container">
        <button type="button" className="button-secondary" onClick={() => navigate(-1)}>
          {text.back}
        </button>

        <ResourceState
          isLoading={isLoading}
          error={error}
          skeletonCount={1}
          loadingClassName="loading-grid"
          errorMessage={text.error}
        >
          {product ? (
            <article className="product-detail">
              <div className="product-detail-media">
                <img
                  src={resolveMediaUrl(product.image, product.name)}
                  alt={`Illustration de ${product.name}`}
                  loading="lazy"
                />
              </div>
              <div className="product-detail-body">
                <span className="eyebrow">{product.category?.name ?? text.fallbackCategory}</span>
                <h1 className="section-title">{product.name}</h1>
                <p className="section-copy">{product.description}</p>

                <div className="product-detail-price">{formatPrice(product.price)}</div>

                <div className="product-detail-controls">
                  <label className="auth-field">
                    <span>{text.quantityLabel}</span>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    />
                  </label>
                  <label className="auth-field">
                    <span>{text.durationLabel}</span>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value) || 1)}
                    >
                      <option value={1}>1 {text.month}</option>
                      <option value={3}>3 {text.months}</option>
                      <option value={6}>6 {text.months}</option>
                      <option value={12}>12 {text.months}</option>
                    </select>
                  </label>
                </div>

                <div className="hero-actions">
                  <button type="button" className="button-primary" onClick={handleAddToCart}>
                    {text.addToCart}
                  </button>
                  <Link className="button-secondary" to="/products">
                    {text.continue}
                  </Link>
                </div>

                {feedback ? (
                  <div className="auth-feedback auth-feedback-info">{feedback}</div>
                ) : null}
              </div>
            </article>
          ) : null}
        </ResourceState>
      </div>
    </section>
  )
}
