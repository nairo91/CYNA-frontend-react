/* eslint-disable react/prop-types */
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronRight,
  CreditCard,
  MapPin,
  ShoppingBag,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { createAddress, getMyAddresses } from '../api/addressApi'
import { AddressAutocomplete } from '../components/AddressAutocomplete'
import { createCheckoutPaymentIntent } from '../api/checkoutApi'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { cn } from '../lib/utils'

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null

const STEPS = ['address', 'summary', 'payment', 'confirmation']

function makeFormatPrice(locale) {
  return (value) => {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return '—'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(numeric)
  }
}

function Stepper({ currentStep, text }) {
  const labels = [
    { key: 'address', label: text.stepperAddress, Icon: MapPin },
    { key: 'summary', label: text.stepperSummary, Icon: ShoppingBag },
    { key: 'payment', label: text.stepperPayment, Icon: CreditCard },
    { key: 'confirmation', label: text.stepperConfirmation, Icon: Check },
  ]
  const currentIdx = STEPS.indexOf(currentStep)

  return (
    <ol
      className="mb-10 flex items-start gap-2 overflow-x-auto"
      aria-label={text.stepperAriaLabel}
    >
      {labels.map((stepInfo, index) => {
        const isCurrent = index === currentIdx
        const isDone = index < currentIdx
        const { Icon } = stepInfo
        return (
          <li
            key={stepInfo.key}
            aria-current={isCurrent ? 'step' : undefined}
            className="flex flex-1 min-w-[6rem] items-start gap-2"
          >
            <div className="flex flex-1 flex-col items-center gap-2 text-center">
              <span
                aria-hidden="true"
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                  isDone && 'border-primary bg-primary text-primary-foreground',
                  isCurrent && 'border-primary bg-primary/10 text-primary',
                  !isDone && !isCurrent && 'border-border bg-card text-muted-foreground'
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <span
                className={cn(
                  'text-xs font-medium',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                <span className="block font-mono uppercase tracking-wider">
                  {text.stepLabel} {index + 1}
                </span>
                {stepInfo.label}
              </span>
            </div>
            {index < labels.length - 1 ? (
              <ChevronRight
                className="mt-2 h-4 w-4 flex-shrink-0 text-muted-foreground/40"
                aria-hidden="true"
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
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
    <form className="grid gap-4" onSubmit={handlePayment}>
      <PaymentElement />
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      ) : null}
      <button
        type="submit"
        disabled={!stripe || isPaying}
        className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        {isPaying ? text.paymentSubmitting : text.paymentSubmit}
      </button>
    </form>
  )
}

export function CheckoutPage() {
  const { t, i18n } = useTranslation('checkout')
  const text = t('checkout', { returnObjects: true })
  const formatPrice = makeFormatPrice(i18n.resolvedLanguage === 'en' ? 'en-GB' : 'fr-FR')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cartId, items, subtotal, clearCart } = useCart()

  const [step, setStep] = useState('address')
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
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (user) {
      setNewAddress((current) => ({
        ...current,
        firstname: current.firstname || user.firstname || '',
        lastname: current.lastname || user.lastname || '',
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
          colorPrimary: '#22d3ee',
          colorBackground: '#0b0b23',
          colorText: '#fafafa',
          colorDanger: '#f43f5e',
          borderRadius: '8px',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
      },
    }
  }, [checkoutIntent])

  const goToAddressStep = () => {
    setStep('address')
    setCheckoutIntent(null)
  }

  const handleAddressContinue = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (showNewAddress) {
      try {
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
        const iri = `/api/addresses/${created.id}`
        setSelectedAddress(iri)
        setAddresses((current) => [...current, created])
        setShowNewAddress(false)
        setStep('summary')
      } catch (err) {
        setErrorMessage(err?.message ?? text.genericError)
      }
      return
    }

    if (!selectedAddress) {
      setErrorMessage(text.addressNeeded)
      return
    }
    setStep('summary')
  }

  const handlePreparePayment = async () => {
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
    if (!selectedAddress) {
      setErrorMessage(text.addressNeeded)
      setStep('address')
      return
    }

    setIsSubmitting(true)
    try {
      const intent = await createCheckoutPaymentIntent({
        cartId,
        billingAddress: selectedAddress,
      })
      setCheckoutIntent(intent)
      setStep('payment')
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

  const updField = (field) => (event) =>
    setNewAddress((current) => ({ ...current, [field]: event.target.value }))

  const selectedAddressObject = useMemo(() => {
    if (!selectedAddress) return null
    const id = Number(selectedAddress.split('/').pop())
    return addresses.find((a) => a.id === id) ?? null
  }, [selectedAddress, addresses])

  return (
    <div className="mx-auto w-full max-w-[var(--page-max-width)] px-4 py-12 lg:px-6 lg:py-16">
      <header className="mb-8">
        <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {text.eyebrow}
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
          {text.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{text.copy}</p>
      </header>

      <Stepper currentStep={step} text={text} />

      {errorMessage ? (
        <div
          role="alert"
          className="mb-6 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-10">
        <div>
          {step === 'address' ? (
            <form
              onSubmit={handleAddressContinue}
              className="rounded-2xl border border-border bg-card p-6 lg:p-8"
            >
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {text.addressLegend}
              </h2>

              {addresses.length > 0 && !showNewAddress ? (
                <div className="mt-6 space-y-3">
                  {addresses.map((addr) => {
                    const iri = `/api/addresses/${addr.id}`
                    const isChecked = selectedAddress === iri
                    return (
                      <label
                        key={addr.id}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-4 transition-colors',
                          isChecked
                            ? 'border-primary ring-1 ring-primary/40'
                            : 'border-border hover:border-primary/40'
                        )}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={iri}
                          checked={isChecked}
                          onChange={() => setSelectedAddress(iri)}
                          className="mt-1 h-4 w-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <span className="text-sm text-foreground">
                          <strong className="block font-medium">
                            {addr.firstname} {addr.lastname}
                          </strong>
                          <span className="mt-0.5 block text-muted-foreground">
                            {addr.adresse1}
                            {addr.adresse2 ? `, ${addr.adresse2}` : ''}
                            <br />
                            {addr.zipCode} {addr.city}, {addr.country}
                          </span>
                        </span>
                      </label>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => setShowNewAddress(true)}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-dashed border-border bg-transparent px-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    + {text.addAddress}
                  </button>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label={text.firstname} value={newAddress.firstname} onChange={updField('firstname')} required />
                  <Field label={text.lastname} value={newAddress.lastname} onChange={updField('lastname')} required />
                  <AddressAutocomplete
                    className="sm:col-span-2"
                    label={text.line1}
                    value={newAddress.adresse1}
                    onChange={(line1) =>
                      setNewAddress((current) => ({ ...current, adresse1: line1 }))
                    }
                    onSelect={(fields) =>
                      setNewAddress((current) => ({
                        ...current,
                        adresse1: fields.line1,
                        zipCode: fields.postalCode || current.zipCode,
                        city: fields.city || current.city,
                        region: fields.region || current.region,
                        country: fields.country || current.country,
                      }))
                    }
                    required
                  />
                  <Field className="sm:col-span-2" label={text.line2} value={newAddress.adresse2} onChange={updField('adresse2')} />
                  <Field label={text.postalCode} value={newAddress.zipCode} onChange={updField('zipCode')} required />
                  <Field label={text.city} value={newAddress.city} onChange={updField('city')} required />
                  <Field label={text.region} value={newAddress.region} onChange={updField('region')} required />
                  <Field label={text.country} value={newAddress.country} onChange={updField('country')} required />
                  <Field className="sm:col-span-2" label={text.mobile} type="tel" value={newAddress.mobilephone} onChange={updField('mobilephone')} required />
                  {addresses.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setShowNewAddress(false)}
                      className="sm:col-span-2 inline-flex h-9 items-center justify-center rounded-md border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {text.cancel}
                    </button>
                  ) : null}
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <Link
                  to="/panier"
                  className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  {text.back}
                </Link>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  {text.continueToSummary}
                  <ChevronRight className="ms-1.5 h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </form>
          ) : null}

          {step === 'summary' ? (
            <div className="space-y-6">
              <section className="rounded-2xl border border-border bg-card p-6 lg:p-8">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    {text.addressSummaryTitle}
                  </h2>
                  <button
                    type="button"
                    onClick={goToAddressStep}
                    className="inline-flex h-8 items-center rounded-md px-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {text.editAddress}
                  </button>
                </div>
                {selectedAddressObject ? (
                  <p className="mt-3 text-sm text-foreground">
                    <strong className="block font-medium">
                      {selectedAddressObject.firstname} {selectedAddressObject.lastname}
                    </strong>
                    <span className="mt-1 block text-muted-foreground">
                      {selectedAddressObject.adresse1}
                      {selectedAddressObject.adresse2
                        ? `, ${selectedAddressObject.adresse2}`
                        : ''}
                      <br />
                      {selectedAddressObject.zipCode} {selectedAddressObject.city},{' '}
                      {selectedAddressObject.country}
                    </span>
                  </p>
                ) : null}
              </section>

              <section className="rounded-2xl border border-border bg-card p-6 lg:p-8">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {text.itemsSummaryTitle}
                </h2>
                <ul className="mt-4 divide-y divide-border">
                  {items.map((it) => (
                    <li
                      key={it.id ?? it.productId}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="text-sm text-foreground">
                        {it.name}{' '}
                        <span className="font-mono tabular-nums text-muted-foreground">
                          ×{it.quantity}
                        </span>
                      </span>
                      <span className="font-mono text-sm font-medium tabular-nums text-foreground">
                        {formatPrice(Number(it.price) * it.quantity * (it.durationMonths ?? 1))}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goToAddressStep}
                  className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  {text.backToPrevious}
                </button>
                <button
                  type="button"
                  onClick={handlePreparePayment}
                  disabled={isSubmitting || items.length === 0}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {isSubmitting ? text.submitting : text.preparePayment}
                  <ChevronRight className="ms-1.5 h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : null}

          {step === 'payment' && checkoutIntent && stripeOptions ? (
            <div className="space-y-6">
              <section className="rounded-2xl border border-border bg-card p-6 lg:p-8">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {text.paymentLegend}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{text.paymentNote}</p>
                <div className="mt-6">
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <StripePaymentForm
                      checkoutIntent={checkoutIntent}
                      text={text}
                      onPaid={handlePaid}
                    />
                  </Elements>
                </div>
              </section>
              <button
                type="button"
                onClick={() => setStep('summary')}
                className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {text.backToPrevious}
              </button>
            </div>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {text.summary}
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              {items.map((it) => (
                <li
                  key={it.id ?? it.productId}
                  className="flex items-baseline justify-between gap-3"
                >
                  <span className="text-muted-foreground">
                    {it.name}{' '}
                    <span className="font-mono tabular-nums">×{it.quantity}</span>
                  </span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {formatPrice(Number(it.price) * it.quantity * (it.durationMonths ?? 1))}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-border pt-4">
              <span className="font-medium text-foreground">{text.total}</span>
              <span className="font-mono text-xl font-semibold tabular-nums text-primary">
                {formatPrice(subtotal)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, required, className }) {
  return (
    <label className={cn('grid gap-1.5', className)}>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        aria-required={required ? 'true' : undefined}
        className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
    </label>
  )
}
