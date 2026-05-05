import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createAddress, getMyAddresses } from '../api/addressApi'
import { createOrder } from '../api/orderApi'
import { getMyPaymentMethods } from '../api/paymentMethodApi'
import { siteText } from '../content/siteText'
import { useCart } from '../context/CartContext'

function formatPrice(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(numeric)
}

export function CheckoutPage() {
  const text = siteText.pages.checkout
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()

  const [addresses, setAddresses] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('')
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    label: 'Adresse principale',
    line1: '',
    line2: '',
    postalCode: '',
    city: '',
    country: 'France',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([getMyAddresses().catch(() => []), getMyPaymentMethods().catch(() => [])])
      .then(([addr, pms]) => {
        if (cancelled) return
        setAddresses(addr)
        setPaymentMethods(pms)
        if (addr[0]) setSelectedAddress(`/api/addresses/${addr[0].id}`)
        if (addr.length === 0) setShowNewAddress(true)
        if (pms[0]) setSelectedPayment(pms[0].id)
      })
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (items.length === 0) {
      setErrorMessage(text.emptyCartError)
      return
    }

    setIsSubmitting(true)
    try {
      let billingAddressIri = selectedAddress
      if (showNewAddress) {
        const created = await createAddress({
          label: newAddress.label || 'Adresse principale',
          line1: newAddress.line1,
          line2: newAddress.line2 || null,
          postalCode: newAddress.postalCode,
          city: newAddress.city,
          country: newAddress.country,
        })
        billingAddressIri = `/api/addresses/${created.id}`
      }

      if (!billingAddressIri) {
        setErrorMessage(text.addressNeeded)
        setIsSubmitting(false)
        return
      }

      const orderItems = items.map((it) => ({
        saasService: `/api/saas_services/${it.productId}`,
        quantity: it.quantity ?? 1,
        durationMonths: it.durationMonths ?? 1,
      }))

      const order = await createOrder({
        billingAddress: billingAddressIri,
        items: orderItems,
      })

      clearCart()
      navigate(`/checkout/confirmation/${order.id}`, { replace: true })
    } catch (err) {
      setErrorMessage(err?.message ?? text.genericError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="section">
      <div className="container">
        <header className="section-heading">
          <span className="eyebrow">{text.eyebrow}</span>
          <h1 className="section-title">{text.title}</h1>
          <p className="section-copy">{text.copy}</p>
        </header>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <fieldset className="panel">
            <legend>{text.addressLegend}</legend>

            {addresses.length > 0 && !showNewAddress ? (
              <>
                {addresses.map((addr) => {
                  const iri = `/api/addresses/${addr.id}`
                  return (
                    <label className="auth-checkbox" key={addr.id}>
                      <input
                        type="radio"
                        name="address"
                        value={iri}
                        checked={selectedAddress === iri}
                        onChange={() => setSelectedAddress(iri)}
                      />
                      <span>{addr.label || addr.line1} - {addr.postalCode} {addr.city}</span>
                    </label>
                  )
                })}
                <button type="button" className="button-secondary" onClick={() => setShowNewAddress(true)}>
                  {text.addAddress}
                </button>
              </>
            ) : (
              <div className="auth-form-grid">
                <label className="auth-field">
                  <span>{text.label}</span>
                  <input value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} />
                </label>
                <label className="auth-field">
                  <span>{text.line1}</span>
                  <input required value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} />
                </label>
                <label className="auth-field">
                  <span>{text.line2}</span>
                  <input value={newAddress.line2} onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })} />
                </label>
                <label className="auth-field">
                  <span>{text.postalCode}</span>
                  <input required value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} />
                </label>
                <label className="auth-field">
                  <span>{text.city}</span>
                  <input required value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                </label>
                <label className="auth-field">
                  <span>{text.country}</span>
                  <input required value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} />
                </label>
                {addresses.length > 0 ? (
                  <button type="button" className="button-secondary" onClick={() => setShowNewAddress(false)}>
                    {text.cancel}
                  </button>
                ) : null}
              </div>
            )}
          </fieldset>

          <fieldset className="panel">
            <legend>{text.paymentLegend}</legend>
            {paymentMethods.length === 0 ? (
              <p className="section-copy">{text.paymentNote}</p>
            ) : (
              paymentMethods.map((pm) => (
                <label className="auth-checkbox" key={pm.id}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.id}
                    checked={selectedPayment === pm.id}
                    onChange={() => setSelectedPayment(pm.id)}
                  />
                  <span>{pm.label} - **** {pm.maskedNumber ?? ''}</span>
                </label>
              ))
            )}
          </fieldset>

          <aside className="panel checkout-summary">
            <h2>{text.summary}</h2>
            {items.map((it) => (
              <div className="checkout-summary-row" key={it.id ?? it.productId}>
                <span>{it.name} x{it.quantity}</span>
                <span>{formatPrice(Number(it.price) * it.quantity)}</span>
              </div>
            ))}
            <hr />
            <div className="checkout-summary-row">
              <strong>{text.total}</strong>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
          </aside>

          {errorMessage ? <div className="auth-feedback auth-feedback-error">{errorMessage}</div> : null}

          <div className="hero-actions">
            <button type="submit" className="button-primary" disabled={isSubmitting || items.length === 0}>
              {isSubmitting ? text.submitting : text.submit}
            </button>
            <Link className="button-secondary" to="/panier">{text.back}</Link>
          </div>
        </form>
      </div>
    </section>
  )
}
