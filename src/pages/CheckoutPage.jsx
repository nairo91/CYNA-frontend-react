/* eslint-disable react/prop-types */
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createAddress, getMyAddresses } from '../api/addressApi'
import { createCheckoutPaymentIntent } from '../api/checkoutApi'
import { siteText } from '../content/siteText'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null

function formatPrice(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '---'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(numeric)
}

function StripePaymentForm({ checkoutIntent, text, onPaid }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isPaying, setIsPaying] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handlePayment = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!stripe || !elements) return

    setIsPaying(true)
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/confirmation/${checkoutIntent.orderId}`,
      },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message ?? text.paymentError)
      setIsPaying(false)
      return
    }

    if (paymentIntent && paymentIntent.status !== 'succeeded') {
      setErrorMessage(text.paymentPending)
      setIsPaying(false)
      return
    }

    onPaid(checkoutIntent.orderId)
  }

  return (
    <form className="stripe-payment-form" onSubmit={handlePayment}>
      <PaymentElement />
      {errorMessage ? <div className="auth-feedback auth-feedback-error">{errorMessage}</div> : null}
      <button type="submit" className="button-primary" disabled={!stripe || isPaying}>
        {isPaying ? text.paymentSubmitting : text.paymentSubmit}
      </button>
    </form>
  )
}

export function CheckoutPage() {
  const text = siteText.pages.checkout
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cartId, items, subtotal, clearCart } = useCart()

  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    firstname: user?.firstname ?? '',
    lastname: user?.lastname ?? '',
    adresse1: '',
    adresse2: '',
    zipCode: '',
    city: '',
    region: '',
    country: 'France',
    mobilephone: '',
  })
  const [checkoutIntent, setCheckoutIntent] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    getMyAddresses()
      .then((addr) => {
        if (cancelled) return
        setAddresses(addr)
        if (addr[0]) setSelectedAddress(`/api/addresses/${addr[0].id}`)
        if (addr.length === 0) setShowNewAddress(true)
      })
      .catch(() => {
        if (!cancelled) setShowNewAddress(true)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (user) {
      setNewAddress((a) => ({
        ...a,
        firstname: a.firstname || user.firstname || '',
        lastname: a.lastname || user.lastname || '',
      }))
    }
  }, [user])

  const stripeOptions = useMemo(() => {
    if (!checkoutIntent?.clientSecret) return null
    return {
      clientSecret: checkoutIntent.clientSecret,
      appearance: {
        theme: 'night',
        variables: {
          colorPrimary: '#1d8dff',
          colorBackground: '#0d1628',
          colorText: '#ffffff',
          colorDanger: '#ff5959',
          borderRadius: '8px',
        },
      },
    }
  }, [checkoutIntent])

  const handlePreparePayment = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!stripePromise) {
      setErrorMessage(text.stripeKeyMissing)
      return
    }

    if (items.length === 0) {
      setErrorMessage(text.emptyCartError)
      return
    }

    if (!cartId) {
      setErrorMessage(text.cartSyncError)
      return
    }

    setIsSubmitting(true)
    try {
      let billingAddressIri = selectedAddress
      if (showNewAddress) {
        const created = await createAddress({
          firstname: newAddress.firstname,
          lastname: newAddress.lastname,
          adresse1: newAddress.adresse1,
          adresse2: newAddress.adresse2 || null,
          zipCode: newAddress.zipCode,
          city: newAddress.city,
          region: newAddress.region,
          country: newAddress.country,
          mobilephone: newAddress.mobilephone,
        })
        billingAddressIri = `/api/addresses/${created.id}`
        setSelectedAddress(billingAddressIri)
      }

      if (!billingAddressIri) {
        setErrorMessage(text.addressNeeded)
        return
      }

      const intent = await createCheckoutPaymentIntent({
        cartId,
        billingAddress: billingAddressIri,
      })
      setCheckoutIntent(intent)
    } catch (err) {
      setErrorMessage(err?.message ?? text.genericError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaid = (orderId) => {
    clearCart()
    navigate(`/checkout/confirmation/${orderId}`, { replace: true })
  }

  const upd = (field) => (e) => {
    setCheckoutIntent(null)
    setNewAddress({ ...newAddress, [field]: e.target.value })
  }

  return (
    <section className="section">
      <div className="container">
        <header className="section-heading">
          <span className="eyebrow">{text.eyebrow}</span>
          <h1 className="section-title">{text.title}</h1>
          <p className="section-copy">{text.copy}</p>
        </header>

        <div className="checkout-form">
          <form className="checkout-main" onSubmit={handlePreparePayment}>
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
                          onChange={() => {
                            setSelectedAddress(iri)
                            setCheckoutIntent(null)
                          }}
                        />
                        <span>{addr.firstname} {addr.lastname} - {addr.adresse1} - {addr.zipCode} {addr.city}</span>
                      </label>
                    )
                  })}
                  <button type="button" className="button-secondary" onClick={() => { setShowNewAddress(true); setCheckoutIntent(null) }}>
                    {text.addAddress}
                  </button>
                </>
              ) : (
                <div className="auth-form-grid">
                  <label className="auth-field"><span>{text.firstname}</span><input required value={newAddress.firstname} onChange={upd('firstname')} /></label>
                  <label className="auth-field"><span>{text.lastname}</span><input required value={newAddress.lastname} onChange={upd('lastname')} /></label>
                  <label className="auth-field"><span>{text.line1}</span><input required value={newAddress.adresse1} onChange={upd('adresse1')} /></label>
                  <label className="auth-field"><span>{text.line2}</span><input value={newAddress.adresse2} onChange={upd('adresse2')} /></label>
                  <label className="auth-field"><span>{text.postalCode}</span><input required value={newAddress.zipCode} onChange={upd('zipCode')} /></label>
                  <label className="auth-field"><span>{text.city}</span><input required value={newAddress.city} onChange={upd('city')} /></label>
                  <label className="auth-field"><span>{text.region}</span><input required value={newAddress.region} onChange={upd('region')} /></label>
                  <label className="auth-field"><span>{text.country}</span><input required value={newAddress.country} onChange={upd('country')} /></label>
                  <label className="auth-field"><span>{text.mobile}</span><input required type="tel" value={newAddress.mobilephone} onChange={upd('mobilephone')} /></label>
                  {addresses.length > 0 ? (
                    <button type="button" className="button-secondary" onClick={() => { setShowNewAddress(false); setCheckoutIntent(null) }}>
                      {text.cancel}
                    </button>
                  ) : null}
                </div>
              )}
            </fieldset>

            {!checkoutIntent ? (
              <div className="hero-actions">
                <button type="submit" className="button-primary" disabled={isSubmitting || items.length === 0}>
                  {isSubmitting ? text.submitting : text.preparePayment}
                </button>
                <Link className="button-secondary" to="/panier">{text.back}</Link>
              </div>
            ) : null}
          </form>

          <aside className="panel checkout-summary">
            <h2>{text.summary}</h2>
            {items.map((it) => (
              <div className="checkout-summary-row" key={it.id ?? it.productId}>
                <span>{it.name} x{it.quantity}</span>
                <span>{formatPrice(Number(it.price) * it.quantity * (it.durationMonths ?? 1))}</span>
              </div>
            ))}
            <hr />
            <div className="checkout-summary-row">
              <strong>{text.total}</strong>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
          </aside>

          {errorMessage ? <div className="auth-feedback auth-feedback-error">{errorMessage}</div> : null}

          {checkoutIntent && stripeOptions ? (
            <section className="panel checkout-payment-panel">
              <h2>{text.paymentLegend}</h2>
              <p className="section-copy">{text.paymentNote}</p>
              <Elements stripe={stripePromise} options={stripeOptions}>
                <StripePaymentForm checkoutIntent={checkoutIntent} text={text} onPaid={handlePaid} />
              </Elements>
            </section>
          ) : null}
        </div>
      </div>
    </section>
  )
}
