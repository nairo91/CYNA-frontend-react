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
  { id: 'profile', labelKey: 'tabProfile', icon: 'person' },
  { id: 'orders', labelKey: 'tabOrders', icon: 'shopping_bag' },
  { id: 'addresses', labelKey: 'tabAddresses', icon: 'location_on' },
  { id: 'payments', labelKey: 'tabPayments', icon: 'credit_card' },
  { id: 'security', labelKey: 'tabSecurity', icon: 'security' },
  { id: 'mail', labelKey: 'tabMail', icon: 'mail' },
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
    <section className="py-12 bg-base-100 flex-grow">
      <div className="container mx-auto px-4 max-w-7xl">
        <header className="mb-8">
          <span className="badge badge-primary badge-outline font-semibold mb-3">{text.eyebrow}</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">
            {user?.firstname ? `${text.greeting}, ${user.firstname}` : text.title}
          </h1>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-1/4 flex-shrink-0">
            <ul className="menu bg-base-200/50 backdrop-blur-sm w-full rounded-2xl shadow-xl border border-base-300 gap-1 p-3 sticky top-24">
              {TABS.map((tab) => (
                <li key={tab.id}>
                  <button
                    type="button"
                    className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${
                      activeTab === tab.id 
                        ? 'active bg-primary text-primary-content shadow-md shadow-primary/20 hover:bg-primary-focus' 
                        : 'hover:bg-base-300 text-base-content/80 hover:text-base-content'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                    <span className="font-medium text-[15px]">{text[tab.labelKey]}</span>
                  </button>
                </li>
              ))}
              <div className="divider my-2"></div>
              <li>
                <button 
                  type="button" 
                  className="flex items-center gap-3 py-3 px-4 rounded-xl text-error hover:bg-error/10 hover:text-error transition-colors" 
                  onClick={handleLogout}
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  <span className="font-medium text-[15px]">{text.logout}</span>
                </button>
              </li>
            </ul>
          </aside>

          {/* Main Content Area */}
          <main className="w-full lg:w-3/4">
            <div className="bg-base-200/40 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-base-300 min-h-[500px]">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-base-content border-b border-base-300 pb-4">
                <span className="material-symbols-outlined text-primary text-3xl">
                  {TABS.find(t => t.id === activeTab)?.icon}
                </span>
                {text[TABS.find(t => t.id === activeTab)?.labelKey]}
              </h2>
              
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'profile' ? <ProfileTab user={user} text={text} /> : null}
                {activeTab === 'orders' ? <OrdersTab text={text} /> : null}
                {activeTab === 'addresses' ? <AddressesTab text={text} user={user} /> : null}
                {activeTab === 'payments' ? <PaymentsTab text={text} /> : null}
                {activeTab === 'security' ? <SecuritySettings currentUser={user} onUserUpdate={checkAuth} /> : null}
                {activeTab === 'mail' ? <MailTab text={text} user={user} /> : null}
              </div>
            </div>
          </main>
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
    <form className="max-w-xl" onSubmit={handleSubmit}>
      <p className="text-base-content/70 mb-6">{text.mailIntro}</p>
      
      <div className="space-y-4 mb-6">
        <div className="form-control w-full">
          <label className="label"><span className="label-text font-medium">{text.mailRecipient}</span></label>
          <div className="input-group relative flex items-center">
            <span className="absolute left-3 material-symbols-outlined text-base-content/50">mail</span>
            <input
              type="email"
              className="input input-bordered w-full pl-10 focus:border-primary"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </div>
        
        <div className="form-control w-full">
          <label className="label"><span className="label-text font-medium">{text.mailAccount}</span></label>
          <div className="input-group relative flex items-center">
            <span className="absolute left-3 material-symbols-outlined text-base-content/50">person</span>
            <input className="input input-bordered w-full pl-10 opacity-70 cursor-not-allowed bg-base-200" value={user?.email ?? ''} readOnly />
          </div>
        </div>
      </div>
      
      {errorMessage && (
        <div className="alert alert-error shadow-lg mb-6 rounded-xl">
          <span className="material-symbols-outlined">error</span>
          <span>{errorMessage}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success shadow-lg mb-6 rounded-xl text-success-content">
          <span className="material-symbols-outlined">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}
      
      <button type="submit" className="btn btn-primary" disabled={isSending}>
        {isSending && <span className="loading loading-spinner"></span>}
        <span className="material-symbols-outlined mr-1">send</span>
        {isSending ? text.mailSending : text.mailSend}
      </button>
    </form>
  )
}

function ProfileTab({ user, text }) {
  if (!user) return <div className="flex justify-center p-8"><span className="loading loading-spinner text-primary loading-lg"></span></div>
  
  const stats = [
    { label: text.profileFirstname, value: user.firstname || '—', icon: 'badge' },
    { label: text.profileLastname, value: user.lastname || '—', icon: 'assignment_ind' },
    { label: text.profileEmail, value: user.email, icon: 'mail' },
    { label: text.profileVerified, value: user.isVerified ? text.yes : text.no, icon: user.isVerified ? 'verified' : 'pending', color: user.isVerified ? 'text-success' : 'text-warning' },
    { label: text.profileRoles, value: (user.roles ?? []).join(', '), icon: 'admin_panel_settings' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="card bg-base-100 shadow-sm border border-base-200/60 hover:shadow-md transition-all">
          <div className="card-body p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center flex-shrink-0">
                <span className={`material-symbols-outlined ${stat.color || 'text-primary'}`}>{stat.icon}</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">{stat.label}</h3>
                <p className="text-base font-semibold text-base-content break-all">{stat.value}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
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

  if (isLoading) return <div className="flex justify-center p-8"><span className="loading loading-spinner text-primary loading-lg"></span></div>
  
  if (orders.length === 0) return (
    <div className="text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-3xl bg-base-100/50">
      <span className="material-symbols-outlined text-6xl text-base-content/20 mb-4 block">receipt_long</span>
      <p className="text-lg text-base-content/60 font-medium">{text.ordersEmpty}</p>
      <Link to="/products" className="btn btn-primary mt-6">Découvrir nos solutions</Link>
    </div>
  )

  return (
    <div className="overflow-x-auto bg-base-100 rounded-2xl border border-base-200 shadow-sm">
      <table className="table table-zebra w-full">
        <thead>
          <tr className="bg-base-200 text-base-content/70">
            <th className="rounded-tl-2xl font-semibold">Référence</th>
            <th className="font-semibold">Date</th>
            <th className="font-semibold">Statut</th>
            <th className="font-semibold text-right">Montant</th>
            <th className="rounded-tr-2xl text-center font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="hover">
              <td className="font-medium whitespace-nowrap">{o.reference ?? `#${o.id}`}</td>
              <td className="whitespace-nowrap text-base-content/80">{formatDate(o.createdAt)}</td>
              <td>
                <span className={`badge ${o.status === 'COMPLETED' ? 'badge-success' : o.status === 'PENDING' ? 'badge-warning' : 'badge-ghost'} badge-sm`}>
                  {o.status}
                </span>
              </td>
              <td className="text-right font-bold whitespace-nowrap">{formatPrice(o.totalPrice)}</td>
              <td className="text-center">
                <Link className="btn btn-sm btn-ghost btn-circle" to={`/checkout/confirmation/${o.id}`} title={text.view}>
                  <span className="material-symbols-outlined text-lg">visibility</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette adresse ?")) return;
    try {
      await deleteAddress(id)
      reload()
    } catch (err) {
      setErrorMessage(err?.message ?? text.genericError)
    }
  }

  const upd = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  if (isLoading) return <div className="flex justify-center p-8"><span className="loading loading-spinner text-primary loading-lg"></span></div>

  return (
    <div>
      {!showForm && (
        <div className="mb-8 flex justify-between items-center">
          <p className="text-base-content/70">Gérez vos adresses de facturation et de livraison.</p>
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
            <span className="material-symbols-outlined">add</span>
            {text.addAddress}
          </button>
        </div>
      )}

      {!showForm && addresses.length === 0 && (
        <div className="text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-3xl bg-base-100/50">
          <span className="material-symbols-outlined text-6xl text-base-content/20 mb-4 block">location_off</span>
          <p className="text-lg text-base-content/60 font-medium">{text.addressesEmpty}</p>
        </div>
      )}

      {!showForm && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {addresses.map((a) => (
            <div className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-shadow" key={a.id}>
              <div className="card-body p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="card-title text-lg font-bold">{a.firstname} {a.lastname}</h3>
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm">
                      <span className="material-symbols-outlined text-base-content/50">more_vert</span>
                    </div>
                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-xl border border-base-200">
                      <li>
                        <button type="button" className="text-error hover:bg-error/10 hover:text-error" onClick={() => handleDelete(a.id)}>
                          <span className="material-symbols-outlined text-sm">delete</span>
                          {text.delete}
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="text-sm text-base-content/70 space-y-1">
                  <p>{a.adresse1}</p>
                  {a.adresse2 && <p>{a.adresse2}</p>}
                  <p>{a.zipCode} {a.city}</p>
                  <p>{a.region}, {a.country}</p>
                  <p className="mt-3 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">phone</span> {a.mobilephone}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body p-6 md:p-8">
            <div className="flex justify-between items-center border-b border-base-200 pb-4 mb-6">
              <h3 className="text-xl font-bold">Nouvelle adresse</h3>
              <button className="btn btn-sm btn-ghost btn-circle" onClick={() => { setShowForm(false); setErrorMessage('') }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="form-control w-full">
                  <label className="label"><span className="label-text">{text.firstname}</span></label>
                  <input className="input input-bordered w-full" required value={form.firstname} onChange={upd('firstname')} />
                </div>
                <div className="form-control w-full">
                  <label className="label"><span className="label-text">{text.lastname}</span></label>
                  <input className="input input-bordered w-full" required value={form.lastname} onChange={upd('lastname')} />
                </div>
                <div className="form-control w-full md:col-span-2">
                  <label className="label"><span className="label-text">{text.fieldLine1}</span></label>
                  <input className="input input-bordered w-full" required value={form.adresse1} onChange={upd('adresse1')} />
                </div>
                <div className="form-control w-full md:col-span-2">
                  <label className="label"><span className="label-text">{text.fieldLine2}</span></label>
                  <input className="input input-bordered w-full" value={form.adresse2} onChange={upd('adresse2')} />
                </div>
                <div className="form-control w-full">
                  <label className="label"><span className="label-text">{text.fieldPostal}</span></label>
                  <input className="input input-bordered w-full" required value={form.zipCode} onChange={upd('zipCode')} />
                </div>
                <div className="form-control w-full">
                  <label className="label"><span className="label-text">{text.fieldCity}</span></label>
                  <input className="input input-bordered w-full" required value={form.city} onChange={upd('city')} />
                </div>
                <div className="form-control w-full">
                  <label className="label"><span className="label-text">{text.fieldRegion}</span></label>
                  <input className="input input-bordered w-full" required value={form.region} onChange={upd('region')} />
                </div>
                <div className="form-control w-full">
                  <label className="label"><span className="label-text">{text.fieldCountry}</span></label>
                  <input className="input input-bordered w-full" required value={form.country} onChange={upd('country')} />
                </div>
                <div className="form-control w-full md:col-span-2">
                  <label className="label"><span className="label-text">{text.fieldMobile}</span></label>
                  <input className="input input-bordered w-full" required type="tel" value={form.mobilephone} onChange={upd('mobilephone')} />
                </div>
              </div>
              
              {errorMessage && (
                <div className="alert alert-error shadow-lg mt-6 rounded-xl">
                  <span className="material-symbols-outlined">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}
              
              <div className="flex gap-3 mt-8 justify-end">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setErrorMessage('') }}>{text.cancel}</button>
                <button type="submit" className="btn btn-primary">{text.save}</button>
              </div>
            </form>
          </div>
        </div>
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
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce moyen de paiement ?")) return;
    try { await deletePaymentMethod(id); reload() } catch (err) { setErrorMessage(err?.message ?? text.genericError) }
  }

  if (isLoading) return <div className="flex justify-center p-8"><span className="loading loading-spinner text-primary loading-lg"></span></div>

  return (
    <div>
      {!showForm && (
        <div className="mb-8 flex justify-between items-center">
          <p className="text-base-content/70">Gérez vos cartes bancaires enregistrées.</p>
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(true)}>
            <span className="material-symbols-outlined">add</span>
            {text.addPayment}
          </button>
        </div>
      )}

      {!showForm && methods.length === 0 && (
        <div className="text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-3xl bg-base-100/50">
          <span className="material-symbols-outlined text-6xl text-base-content/20 mb-4 block">credit_card_off</span>
          <p className="text-lg text-base-content/60 font-medium">{text.paymentsEmpty}</p>
        </div>
      )}

      {!showForm && methods.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {methods.map((pm) => (
            <div className="card bg-gradient-to-br from-base-100 to-base-200 border border-base-300 shadow-md hover:shadow-lg transition-all" key={pm.id}>
              <div className="card-body p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-2xl font-black italic tracking-widest text-base-content/40 uppercase">
                    {pm.brand ?? pm.provider}
                  </div>
                  <button className="btn btn-circle btn-sm btn-ghost hover:bg-error hover:text-error-content" onClick={() => handleDelete(pm.id)} title={text.delete}>
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
                <div className="font-mono text-xl tracking-widest text-base-content/80">
                  •••• •••• •••• {pm.last4}
                </div>
                <div className="flex justify-between items-end mt-4 text-sm text-base-content/60 font-mono">
                  <span>EXP {pm.expMonth.toString().padStart(2, '0')}/{pm.expYear.toString().slice(-2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="card bg-base-100 shadow-xl border border-base-200 max-w-2xl">
          <div className="card-body p-6 md:p-8">
            <div className="flex justify-between items-center border-b border-base-200 pb-4 mb-6">
              <h3 className="text-xl font-bold">Nouveau moyen de paiement</h3>
              <button className="btn btn-sm btn-ghost btn-circle" onClick={() => { setShowForm(false); setErrorMessage('') }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="alert alert-info shadow-sm mb-6 rounded-xl bg-info/10 text-info">
                <span className="material-symbols-outlined">info</span>
                <span className="text-sm">{text.paymentsNote}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control w-full col-span-2">
                  <label className="label"><span className="label-text font-medium">{text.paymentBrand}</span></label>
                  <select className="select select-bordered w-full font-medium" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}>
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Amex">American Express</option>
                  </select>
                </div>
                <div className="form-control w-full col-span-2">
                  <label className="label"><span className="label-text font-medium">{text.paymentLast4}</span></label>
                  <input className="input input-bordered w-full font-mono tracking-widest" placeholder="1234" maxLength={4} pattern="\d{4}" value={form.last4} onChange={(e) => setForm({ ...form, last4: e.target.value })} required />
                </div>
                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">{text.paymentMonth}</span></label>
                  <input className="input input-bordered w-full text-center" type="number" min={1} max={12} placeholder="MM" value={form.expMonth} onChange={(e) => setForm({ ...form, expMonth: e.target.value })} required />
                </div>
                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">{text.paymentYear}</span></label>
                  <input className="input input-bordered w-full text-center" type="number" min={new Date().getFullYear()} placeholder="YYYY" value={form.expYear} onChange={(e) => setForm({ ...form, expYear: e.target.value })} required />
                </div>
              </div>
              
              {errorMessage && (
                <div className="alert alert-error shadow-lg mt-6 rounded-xl">
                  <span className="material-symbols-outlined">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}
              
              <div className="flex gap-3 mt-8 justify-end">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setErrorMessage('') }}>{text.cancel}</button>
                <button type="submit" className="btn btn-primary">{text.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
