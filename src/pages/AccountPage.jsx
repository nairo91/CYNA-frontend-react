import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createAddress, deleteAddress, getMyAddresses } from '../api/addressApi'
import { sendTestMail } from '../api/mailApi'
import { getMyOrders } from '../api/orderApi'
import { createPaymentMethod, deletePaymentMethod, getMyPaymentMethods } from '../api/paymentMethodApi'
import SecuritySettings from '../components/account/SecuritySettings'
import { siteText } from '../content/siteText'
import { useAuth } from '../context/AuthContext'

const TABS = [
  { id: 'profile', labelKey: 'tabProfile' },
  { id: 'orders', labelKey: 'tabOrders' },
  { id: 'addresses', labelKey: 'tabAddresses' },
  { id: 'payments', labelKey: 'tabPayments' },
  { id: 'security', labelKey: 'tabSecurity' },
  { id: 'mail', labelKey: 'tabMail' },
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
  const { user, logout, checkAuth } = useAuth()
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
          {activeTab === 'addresses' ? <AddressesTab text={text} user={user} /> : null}
          {activeTab === 'payments' ? <PaymentsTab text={text} /> : null}
          {activeTab === 'security' ? <SecuritySettings currentUser={user} onUserUpdate={checkAuth} /> : null}
          {activeTab === 'mail' ? <MailTab text={text} user={user} /> : null}
        </div>
      </div>
    </section>
  )
}

function MailTab({ text, user }) {
  const [recipient, setRecipient] = useState('juliann.ploquin@gmail.com')
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSending(true)

    try {
      const result = await sendTestMail(recipient.trim())
      setSuccessMessage(text.mailSuccess.replace('{email}', result.recipient ?? recipient.trim()))
    } catch (err) {
      setErrorMessage(err?.message ?? text.genericError)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <p className="section-copy">{text.mailIntro}</p>
      <div className="auth-form-grid">
        <label className="auth-field">
          <span>{text.mailRecipient}</span>
          <input
            type="email"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="auth-field">
          <span>{text.mailAccount}</span>
          <input value={user?.email ?? ''} readOnly />
        </label>
      </div>
      {errorMessage ? <div className="auth-feedback auth-feedback-error">{errorMessage}</div> : null}
      {successMessage ? <div className="auth-feedback auth-feedback-success">{successMessage}</div> : null}
      <div className="hero-actions">
        <button type="submit" className="button-primary" disabled={isSending}>
          {isSending ? text.mailSending : text.mailSend}
        </button>
      </div>
    </form>
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

function AddressesTab({ text, user }) {
  const initialForm = () => ({
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

  const [addresses, setAddresses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [form, setForm] = useState(initialForm())
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
      await createAddress({
        firstname: form.firstname,
        lastname: form.lastname,
        adresse1: form.adresse1,
        adresse2: form.adresse2 || null,
        zipCode: form.zipCode,
        city: form.city,
        region: form.region,
        country: form.country,
        mobilephone: form.mobilephone,
      })
      setForm(initialForm())
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

  const upd = (field) => (e) => setForm({ ...form, [field]: e.target.value })

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
                <strong>{a.firstname} {a.lastname}</strong>
                <p className="section-copy">{a.adresse1}{a.adresse2 ? `, ${a.adresse2}` : ''} - {a.zipCode} {a.city}, {a.region}, {a.country}</p>
                <p className="section-copy">{a.mobilephone}</p>
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
            <label className="auth-field"><span>{text.firstname}</span><input required value={form.firstname} onChange={upd('firstname')} /></label>
            <label className="auth-field"><span>{text.lastname}</span><input required value={form.lastname} onChange={upd('lastname')} /></label>
            <label className="auth-field"><span>{text.fieldLine1}</span><input required value={form.adresse1} onChange={upd('adresse1')} /></label>
            <label className="auth-field"><span>{text.fieldLine2}</span><input value={form.adresse2} onChange={upd('adresse2')} /></label>
            <label className="auth-field"><span>{text.fieldPostal}</span><input required value={form.zipCode} onChange={upd('zipCode')} /></label>
            <label className="auth-field"><span>{text.fieldCity}</span><input required value={form.city} onChange={upd('city')} /></label>
            <label className="auth-field"><span>{text.fieldRegion}</span><input required value={form.region} onChange={upd('region')} /></label>
            <label className="auth-field"><span>{text.fieldCountry}</span><input required value={form.country} onChange={upd('country')} /></label>
            <label className="auth-field"><span>{text.fieldMobile}</span><input required type="tel" value={form.mobilephone} onChange={upd('mobilephone')} /></label>
          </div>
          {errorMessage ? <div className="auth-feedback auth-feedback-error">{errorMessage}</div> : null}
          <div className="hero-actions">
            <button type="submit" className="button-primary">{text.save}</button>
            <button type="button" className="button-secondary" onClick={() => { setShowForm(false); setErrorMessage('') }}>{text.cancel}</button>
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
  const [form, setForm] = useState({ brand: 'Visa', last4: '', expMonth: 12, expYear: new Date().getFullYear() + 3 })
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
    if (!/^\d{4}$/.test(form.last4)) {
      setErrorMessage(text.paymentInvalidLast4)
      return
    }
    try {
      await createPaymentMethod({
        brand: form.brand || 'Visa',
        last4: form.last4,
        expMonth: Number(form.expMonth),
        expYear: Number(form.expYear),
      })
      setShowForm(false)
      setForm({ brand: 'Visa', last4: '', expMonth: 12, expYear: new Date().getFullYear() + 3 })
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
                <strong>{pm.brand ?? pm.provider}</strong>
                <p className="section-copy">**** {pm.last4} - {pm.expMonth}/{pm.expYear}</p>
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
            <label className="auth-field"><span>{text.paymentBrand}</span>
              <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}>
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Amex">American Express</option>
              </select>
            </label>
            <label className="auth-field"><span>{text.paymentLast4}</span><input maxLength={4} pattern="\d{4}" value={form.last4} onChange={(e) => setForm({ ...form, last4: e.target.value })} required /></label>
            <label className="auth-field"><span>{text.paymentMonth}</span><input type="number" min={1} max={12} value={form.expMonth} onChange={(e) => setForm({ ...form, expMonth: e.target.value })} required /></label>
            <label className="auth-field"><span>{text.paymentYear}</span><input type="number" min={new Date().getFullYear()} value={form.expYear} onChange={(e) => setForm({ ...form, expYear: e.target.value })} required /></label>
          </div>
          {errorMessage ? <div className="auth-feedback auth-feedback-error">{errorMessage}</div> : null}
          <div className="hero-actions">
            <button type="submit" className="button-primary">{text.save}</button>
            <button type="button" className="button-secondary" onClick={() => { setShowForm(false); setErrorMessage('') }}>{text.cancel}</button>
          </div>
        </form>
      )}
    </div>
  )
}
