import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createAddress, deleteAddress, getMyAddresses, updateAddress } from '../api/addressApi'
import { getMyOrders } from '../api/orderApi'
import { createPaymentMethod, deletePaymentMethod, getMyPaymentMethods } from '../api/paymentMethodApi'
import { siteText } from '../content/siteText'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { id: 'profile', labelKey: 'tabProfile' },
  { id: 'orders', labelKey: 'tabOrders' },
  { id: 'addresses', labelKey: 'tabAddresses' },
  { id: 'payments', labelKey: 'tabPayments' },
]

function formatPrice(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(n)
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

export function AccountPage() {
  const text = siteText.pages.account
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <section className="section">
      <div className="container">
        <header className="section-heading">
          <span className="eyebrow">{text.eyebrow}</span>
          <h1 className="section-title">
            {user?.firstname ? `${text.greeting}, ${user.firstname}` : text.title}
          </h1>
        </header>

        <nav className="account-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`account-tab${activeTab === tab.id ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {text[tab.labelKey]}
            </button>
          ))}
          <button type="button" className="account-tab" onClick={handleLogout}>
            {text.logout}
          </button>
        </nav>

        <div className="account-panel panel">
          {activeTab === 'profile' ? <ProfileTab user={user} text={text} /> : null}
          {activeTab === 'orders' ? <OrdersTab text={text} /> : null}
          {activeTab === 'addresses' ? <AddressesTab text={text} /> : null}
          {activeTab === 'payments' ? <PaymentsTab text={text} /> : null}
        </div>
      </div>
    </section>
  )
}

function ProfileTab({ user, text }) {
  if (!user) return <p>{text.loading}</p>
  return (
    <dl className="account-identity-grid">
      <div><dt>{text.profileFirstname}</dt><dd>{user.firstname || '—'}</dd></div>
      <div><dt>{text.profileLastname}</dt><dd>{user.lastname || '—'}</dd></div>
      <div><dt>{text.profileEmail}</dt><dd>{user.email}</dd></div>
      <div><dt>{text.profileVerified}</dt><dd>{user.isVerified ? text.yes : text.no}</dd></div>
      <div><dt>{text.profileRoles}</dt><dd>{(user.roles ?? []).join(', ')}</dd></div>
    </dl>
  )
}

function OrdersTab({ text }) {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getMyOrders()
      .then((data) => { if (!cancelled) setOrders(data) })
      .catch(() => { if (!cancelled) setOrders([]) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  if (isLoading) return <p>{text.loading}</p>
  if (orders.length === 0) return <p>{text.ordersEmpty}</p>

  return (
    <ul className="account-list">
      {orders.map((o) => (
        <li className="account-list-item" key={o.id}>
          <div>
            <strong>{o.reference ?? `#${o.id}`}</strong>
            <p className="section-copy">{formatDate(o.createdAt)} - {o.status}</p>
          </div>
          <div className="account-list-amount">{formatPrice(o.totalPrice)}</div>
          <Link className="button-secondary" to={`/checkout/confirmation/${o.id}`}>{text.view}</Link>
        </li>
      ))}
    </ul>
  )
}

function AddressesTab({ text }) {
  const [addresses, setAddresses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState({ label: '', line1: '', line2: '', postalCode: '', city: '', country: 'France' })
  const [showForm, setShowForm] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const reload = () => {
    setIsLoading(true)
    getMyAddresses()
      .then(setAddresses)
      .catch(() => setAddresses([]))
      .finally(() => setIsLoading(false))
  }

  useEffect(reload, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    try {
      await createAddress(form)
      setForm({ label: '', line1: '', line2: '', postalCode: '', city: '', country: 'France' })
      setShowForm(false)
      reload()
    } catch (err) {
      setErrorMessage(err?.message ?? text.genericError)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id)
      reload()
    } catch (err) {
      setErrorMessage(err?.message ?? text.genericError)
    }
  }

  if (isLoading) return <p>{text.loading}</p>

  return (
    <div>
      {addresses.length === 0 ? (
        <p>{text.addressesEmpty}</p>
      ) : (
        <ul className="account-list">
          {addresses.map((a) => (
            <li className="account-list-item" key={a.id}>
              <div>
                <strong>{a.label || a.line1}</strong>
                <p className="section-copy">{a.line1}{a.line2 ? `, ${a.line2}` : ''} - {a.postalCode} {a.city}, {a.country}</p>
              </div>
              <button type="button" className="button-secondary" onClick={() => handleDelete(a.id)}>{text.delete}</button>
            </li>
          ))}
        </ul>
      )}

      {!showForm ? (
        <button type="button" className="button-primary" onClick={() => setShowForm(true)}>{text.addAddress}</button>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-grid">
            <label className="auth-field"><span>{text.fieldLabel}</span><input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></label>
            <label className="auth-field"><span>{text.fieldLine1}</span><input required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} /></label>
            <label className="auth-field"><span>{text.fieldLine2}</span><input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} /></label>
            <label className="auth-field"><span>{text.fieldPostal}</span><input required value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} /></label>
            <label className="auth-field"><span>{text.fieldCity}</span><input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
            <label className="auth-field"><span>{text.fieldCountry}</span><input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></label>
          </div>
          {errorMessage ? <div className="auth-feedback auth-feedback-error">{errorMessage}</div> : null}
          <div className="hero-actions">
            <button type="submit" className="button-primary">{text.save}</button>
            <button type="button" className="button-secondary" onClick={() => setShowForm(false)}>{text.cancel}</button>
          </div>
        </form>
      )}
    </div>
  )
}

function PaymentsTab({ text }) {
  const [methods, setMethods] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ label: '', last4: '', expiryMonth: 12, expiryYear: 2030 })
  const [errorMessage, setErrorMessage] = useState('')

  const reload = () => {
    setIsLoading(true)
    getMyPaymentMethods()
      .then(setMethods)
      .catch(() => setMethods([]))
      .finally(() => setIsLoading(false))
  }

  useEffect(reload, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    try {
      await createPaymentMethod({
        label: form.label || 'Carte bancaire',
        last4: form.last4,
        expiryMonth: Number(form.expiryMonth),
        expiryYear: Number(form.expiryYear),
        provider: 'mock',
      })
      setShowForm(false)
      setForm({ label: '', last4: '', expiryMonth: 12, expiryYear: 2030 })
      reload()
    } catch (err) {
      setErrorMessage(err?.message ?? text.genericError)
    }
  }

  const handleDelete = async (id) => {
    try { await deletePaymentMethod(id); reload() } catch (err) { setErrorMessage(err?.message ?? text.genericError) }
  }

  if (isLoading) return <p>{text.loading}</p>

  return (
    <div>
      {methods.length === 0 ? <p>{text.paymentsEmpty}</p> : (
        <ul className="account-list">
          {methods.map((pm) => (
            <li className="account-list-item" key={pm.id}>
              <div>
                <strong>{pm.label}</strong>
                <p className="section-copy">**** {pm.last4 ?? pm.maskedNumber ?? '????'} - {pm.expiryMonth}/{pm.expiryYear}</p>
              </div>
              <button type="button" className="button-secondary" onClick={() => handleDelete(pm.id)}>{text.delete}</button>
            </li>
          ))}
        </ul>
      )}

      {!showForm ? (
        <button type="button" className="button-primary" onClick={() => setShowForm(true)}>{text.addPayment}</button>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <p className="section-copy">{text.paymentsNote}</p>
          <div className="auth-form-grid">
            <label className="auth-field"><span>{text.paymentLabel}</span><input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></label>
            <label className="auth-field"><span>{text.paymentLast4}</span><input maxLength={4} value={form.last4} onChange={(e) => setForm({ ...form, last4: e.target.value })} required /></label>
            <label className="auth-field"><span>{text.paymentMonth}</span><input type="number" min={1} max={12} value={form.expiryMonth} onChange={(e) => setForm({ ...form, expiryMonth: e.target.value })} required /></label>
            <label className="auth-field"><span>{text.paymentYear}</span><input type="number" min={new Date().getFullYear()} value={form.expiryYear} onChange={(e) => setForm({ ...form, expiryYear: e.target.value })} required /></label>
          </div>
          {errorMessage ? <div className="auth-feedback auth-feedback-error">{errorMessage}</div> : null}
          <div className="hero-actions">
            <button type="submit" className="button-primary">{text.save}</button>
            <button type="button" className="button-secondary" onClick={() => setShowForm(false)}>{text.cancel}</button>
          </div>
        </form>
      )}
    </div>
  )
}
