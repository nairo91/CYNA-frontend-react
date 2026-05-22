/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Eye,
  FileDown,
  Loader2,
  LogOut,

  MapPin,
  Pencil,
  Plus,
  Printer,
  Receipt,
  Search,
  Shield,
  Trash2,
  User,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { updateMyProfile } from '../api/authApi'
import { createAddress, deleteAddress, getMyAddresses, updateAddress } from '../api/addressApi'
import { getMyOrders, getOrder } from '../api/orderApi'
import { downloadInvoicePdf } from '../lib/invoicePdf'
import {
  createPaymentMethod,
  deletePaymentMethod,
  getMyPaymentMethods,
} from '../api/paymentMethodApi'
import { AddressAutocomplete } from '../components/ui/AddressAutocomplete'
import SecuritySettings from '../components/account/SecuritySettings'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'

const INPUT_CLASSES =
  'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40'

const LABEL_CLASSES =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground'

const PRIMARY_BTN =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card'

const GHOST_BTN =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card'

const TABS = [
  { id: 'profile', labelKey: 'tabProfile', Icon: User },
  { id: 'orders', labelKey: 'tabOrders', Icon: Receipt },
  { id: 'addresses', labelKey: 'tabAddresses', Icon: MapPin },
  { id: 'payments', labelKey: 'tabPayments', Icon: CreditCard },
  { id: 'security', labelKey: 'tabSecurity', Icon: Shield },
]

function formatPrice(value, locale) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '—'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(numeric)
}

function formatDate(iso, locale) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function resolveLocale(i18nResolved) {
  return i18nResolved === 'en' ? 'en-GB' : 'fr-FR'
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12 text-muted-foreground" role="status">
      <Loader2 className="h-6 w-6 motion-safe:animate-spin" aria-hidden="true" />
    </div>
  )
}

function EmptyState({ Icon, label, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      {action}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required, className, readOnly }) {
  return (
    <label className={cn('grid gap-1.5', className)}>
      <span className={LABEL_CLASSES.replace('mb-1.5 block ', '')}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        className={cn(INPUT_CLASSES, readOnly && 'cursor-not-allowed opacity-60')}
      />
    </label>
  )
}

export function AccountPage() {
  const { t } = useTranslation('account')
  const text = t('account', { returnObjects: true })
  const navigate = useNavigate()
  const { user, logout, checkAuth } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const activeTabInfo = TABS.find((tab) => tab.id === activeTab)
  const ActiveIcon = activeTabInfo?.Icon ?? User

  return (
    <div className="mx-auto w-full max-w-[var(--page-max-width)] px-4 py-10 lg:px-6 lg:py-14">
      <header className="mb-8">
        <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {text.eyebrow}
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
          {user?.firstname ? `${text.greeting}, ${user.firstname}` : text.title}
        </h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <aside>
          <nav aria-label={text.sectionsAriaLabel} className="lg:sticky lg:top-24">
            <ul className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1.5 lg:flex-col lg:overflow-visible">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id
                const { Icon } = tab
                return (
                  <li key={tab.id} className="flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'inline-flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground/80 hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span className="whitespace-nowrap">{text[tab.labelKey]}</span>
                    </button>
                  </li>
                )
              })}
              <li className="mt-1 hidden lg:block">
                <div className="h-px bg-border" aria-hidden="true" />
              </li>
              <li className="flex-shrink-0">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span className="whitespace-nowrap">{text.logout}</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <main>
          <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
            <h2 className="mb-6 flex items-center gap-3 border-b border-border pb-4 text-xl font-semibold tracking-tight text-foreground">
              <ActiveIcon className="h-5 w-5 text-primary" aria-hidden="true" />
              {text[activeTabInfo?.labelKey ?? 'tabProfile']}
            </h2>
            {activeTab === 'profile' ? (
              <ProfileTab user={user} text={text} onUpdated={checkAuth} />
            ) : null}
            {activeTab === 'orders' ? <OrdersTab text={text} /> : null}
            {activeTab === 'addresses' ? <AddressesTab text={text} user={user} /> : null}
            {activeTab === 'payments' ? <PaymentsTab text={text} /> : null}
            {activeTab === 'security' ? (
              <SecuritySettings currentUser={user} onUserUpdate={checkAuth} />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}

function ProfileTab({ user, text, onUpdated }) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    firstname: user?.firstname ?? '',
    lastname: user?.lastname ?? '',
    email: user?.email ?? '',
  })
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isEditing) {
      setForm({
        firstname: user?.firstname ?? '',
        lastname: user?.lastname ?? '',
        email: user?.email ?? '',
      })
    }
  }, [user, isEditing])

  if (!user) return <LoadingSpinner />

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setStatus('submitting')
    try {
      await updateMyProfile({
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
      })
      setStatus('success')
      setIsEditing(false)
      if (typeof onUpdated === 'function') await onUpdated()
      window.setTimeout(() => setStatus('idle'), 2500)
    } catch (err) {
      setErrorMessage(err?.message ?? text.genericError)
      setStatus('idle')
    }
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Field
          label={text.profileFirstname}
          value={form.firstname}
          onChange={(event) => setForm((current) => ({ ...current, firstname: event.target.value }))}
          required
        />
        <Field
          label={text.profileLastname}
          value={form.lastname}
          onChange={(event) => setForm((current) => ({ ...current, lastname: event.target.value }))}
          required
        />
        <Field
          className="sm:col-span-2"
          label={text.profileEmail}
          value={form.email}
          readOnly
          type="email"
        />
        {errorMessage ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
          <button type="submit" disabled={status === 'submitting'} className={PRIMARY_BTN}>
            {status === 'submitting' ? (
              <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
            ) : null}
            {text.profileSave}
          </button>
          <button type="button" className={GHOST_BTN} onClick={() => setIsEditing(false)}>
            {text.profileCancel}
          </button>
        </div>
      </form>
    )
  }

  const stats = [
    { label: text.profileFirstname, value: user.firstname || '—' },
    { label: text.profileLastname, value: user.lastname || '—' },
    { label: text.profileEmail, value: user.email },
    {
      label: text.profileVerified,
      value: user.isVerified ? text.yes : text.no,
      tone: user.isVerified ? 'success' : 'warning',
    },
    { label: text.profileRoles, value: (user.roles ?? []).join(', ') || '—' },
  ]

  return (
    <div className="grid gap-4">
      {status === 'success' ? (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{text.profileSaved}</span>
        </div>
      ) : null}
      <dl className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-background p-4"
          >
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </dt>
            <dd
              className={cn(
                'mt-1 break-words text-sm font-medium',
                stat.tone === 'success' && 'text-emerald-300',
                stat.tone === 'warning' && 'text-amber-300',
                !stat.tone && 'text-foreground'
              )}
            >
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
      <div>
        <button type="button" className={PRIMARY_BTN} onClick={() => setIsEditing(true)}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
          {text.profileEdit}
        </button>
      </div>
    </div>
  )
}

function OrdersTab({ text }) {
  const { t, i18n } = useTranslation('account')
  const { t: tCheckout } = useTranslation('checkout')
  const locale = resolveLocale(i18n.resolvedLanguage)
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [yearFilter, setYearFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [pdfOrderId, setPdfOrderId] = useState(null)
  const [pdfError, setPdfError] = useState('')

  const handleDownloadInvoice = async (orderId) => {
    setPdfError('')
    setPdfOrderId(orderId)
    try {
      const fullOrder = await getOrder(orderId)
      await downloadInvoicePdf(fullOrder, {
        language: i18n.resolvedLanguage,
        strings: tCheckout('invoice', { returnObjects: true }),
      })
    } catch (err) {
      setPdfError(t('account.ordersDownloadInvoiceError'))
    } finally {
      setPdfOrderId(null)
    }
  }

  useEffect(() => {
    let cancelled = false
    getMyOrders()
      .then((data) => {
        if (!cancelled) setOrders(data)
      })
      .catch(() => {
        if (!cancelled) setOrders([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const years = useMemo(() => {
    const set = new Set(
      orders.map((order) =>
        order.createdAt ? new Date(order.createdAt).getFullYear() : null
      )
    )
    set.delete(null)
    return [...set].sort((a, b) => b - a)
  }, [orders])

  const filtered = useMemo(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase()
    return orders.filter((order) => {
      if (yearFilter !== 'all') {
        const orderYear = order.createdAt
          ? new Date(order.createdAt).getFullYear()
          : null
        if (String(orderYear) !== String(yearFilter)) return false
      }
      if (trimmedSearch) {
        const ref = (order.reference ?? `#${order.id}`).toLowerCase()
        if (!ref.includes(trimmedSearch)) return false
      }
      return true
    })
  }, [orders, yearFilter, searchTerm])

  const grouped = useMemo(() => {
    const map = new Map()
    for (const order of filtered) {
      const year = order.createdAt
        ? new Date(order.createdAt).getFullYear()
        : 'Sans date'
      if (!map.has(year)) map.set(year, [])
      map.get(year).push(order)
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (typeof a === 'string') return 1
      if (typeof b === 'string') return -1
      return Number(b) - Number(a)
    })
  }, [filtered])

  if (isLoading) return <LoadingSpinner />

  if (orders.length === 0) {
    return (
      <EmptyState
        Icon={Receipt}
        label={text.ordersEmpty}
        action={
          <Link to="/products" className={cn(PRIMARY_BTN, 'mt-6')}>
            {t('account.ordersDiscover')}
          </Link>
        }
      />
    )
  }

  const statusLabel = (status) => {
    if (status === 'COMPLETED' || status === 'PAID') return text.ordersStatusCompleted
    if (status === 'PENDING') return text.ordersStatusPending
    if (status === 'CANCELLED') return text.ordersStatusCancelled
    return status
  }

  const statusToneClass = (status) => {
    if (status === 'COMPLETED' || status === 'PAID') {
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
    }
    if (status === 'PENDING') {
      return 'border-amber-400/30 bg-amber-400/10 text-amber-300'
    }
    if (status === 'CANCELLED') {
      return 'border-destructive/30 bg-destructive/10 text-destructive'
    }
    return 'border-border bg-card text-muted-foreground'
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-[1fr_12rem_auto]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={text.ordersSearch}
            className="h-10 w-full rounded-lg border border-border bg-background ps-10 pe-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
            aria-label={text.ordersSearch}
          />
        </div>
        <select
          value={yearFilter}
          onChange={(event) => setYearFilter(event.target.value)}
          aria-label={text.ordersYearFilter}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
        >
          <option value="all">
            {text.ordersYearFilter} — {text.ordersYearAll}
          </option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => window.print()}
          className={GHOST_BTN}
          aria-label={text.ordersPrint}
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          {text.ordersPrint}
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
          {t('account.ordersNoMatch')}
        </p>
      ) : (
        grouped.map(([year, list]) => (
          <section key={year} aria-label={t('account.ordersYearAriaLabel', { year })}>
            <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {year}{' '}
              <span className="text-foreground/40">·</span>{' '}
              {t('account.ordersCount', { count: list.length })}
            </h3>
            <ul className="grid gap-2">
              {list.map((order) => (
                <li key={order.id}>
                  <article className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-medium tabular-nums text-foreground">
                        {order.reference ?? `#${order.id}`}
                      </span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {formatDate(order.createdAt, locale)}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
                        statusToneClass(order.status)
                      )}
                    >
                      {statusLabel(order.status)}
                    </span>
                    <span className="font-mono text-base font-semibold tabular-nums text-primary">
                      {formatPrice(order.totalPrice, locale)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(order.id)}
                        disabled={pdfOrderId === order.id}
                        aria-label={`${t('account.ordersDownloadInvoice')} ${order.reference ?? `#${order.id}`}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {pdfOrderId === order.id ? (
                          <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
                        ) : (
                          <FileDown className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                      <Link
                        to={`/checkout/confirmation/${order.id}`}
                        aria-label={`${text.view} ${order.reference ?? `#${order.id}`}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {pdfError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{pdfError}</span>
        </div>
      ) : null}
    </div>
  )
}

function AddressesTab({ text, user }) {
  const { t } = useTranslation('account')
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
  const [editingId, setEditingId] = useState(null) // null = create mode, number = edit mode
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

  const startEdit = (address) => {
    setForm({
      firstname: address.firstname ?? '',
      lastname: address.lastname ?? '',
      adresse1: address.adresse1 ?? '',
      adresse2: address.adresse2 ?? '',
      zipCode: address.zipCode ?? '',
      city: address.city ?? '',
      region: address.region ?? '',
      country: address.country ?? 'France',
      mobilephone: address.mobilephone ?? '',
    })
    setEditingId(address.id)
    setShowForm(true)
    setErrorMessage('')
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setErrorMessage('')
    setForm(initialForm())
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    const payload = {
      firstname: form.firstname,
      lastname: form.lastname,
      adresse1: form.adresse1,
      adresse2: form.adresse2 || null,
      zipCode: form.zipCode,
      city: form.city,
      region: form.region,
      country: form.country,
      mobilephone: form.mobilephone,
    }
    try {
      if (editingId) {
        await updateAddress(editingId, payload)
      } else {
        await createAddress(payload)
      }
      closeForm()
      reload()
    } catch (err) {
      setErrorMessage(err?.message ?? text.genericError)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('account.deleteAddressConfirm'))) return
    try {
      await deleteAddress(id)
      reload()
    } catch (err) {
      setErrorMessage(err?.message ?? text.genericError)
    }
  }

  const updField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  // Pré-remplissage automatique après sélection d'une suggestion BAN
  const handleAddressSelect = ({ adresse1, zipCode, city, region }) => {
    setForm((current) => ({ ...current, adresse1, zipCode, city, region }))
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="grid gap-6">
      {!showForm ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t('account.addressesIntro')}
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setForm(initialForm())
                setShowForm(true)
              }}
              className={PRIMARY_BTN}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {text.addAddress}
            </button>
          </div>

          {addresses.length === 0 ? (
            <EmptyState Icon={MapPin} label={text.addressesEmpty} />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {addresses.map((address) => (
                <li key={address.id}>
                  <article className="flex h-full flex-col rounded-xl border border-border bg-background p-5">
                    <header className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {address.firstname} {address.lastname}
                      </h3>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(address)}
                          aria-label={`${text.addressEdit} ${address.adresse1}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(address.id)}
                          aria-label={`${text.delete} ${address.adresse1}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </header>
                    <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                      <p>{address.adresse1}</p>
                      {address.adresse2 ? <p>{address.adresse2}</p> : null}
                      <p className="font-mono tabular-nums">
                        {address.zipCode} {address.city}
                      </p>
                      <p>
                        {address.region}, {address.country}
                      </p>
                    </div>
                    <p className="mt-3 inline-flex items-center gap-1 font-mono text-xs tabular-nums text-foreground/70">
                      📞 {address.mobilephone}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-background p-5 lg:p-6">
          <div className="mb-5 flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-semibold text-foreground">
              {editingId ? t('account.editAddressTitle') : t('account.newAddressTitle')}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              aria-label={text.cancel}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={text.firstname} value={form.firstname} onChange={updField('firstname')} required />
            <Field label={text.lastname} value={form.lastname} onChange={updField('lastname')} required />
            <AddressAutocomplete
              className="sm:col-span-2"
              label={text.fieldLine1}
              value={form.adresse1}
              onChange={(val) => setForm((c) => ({ ...c, adresse1: val }))}
              onSelect={handleAddressSelect}
              required
            />
            <Field className="sm:col-span-2" label={text.fieldLine2} value={form.adresse2} onChange={updField('adresse2')} />
            <Field label={text.fieldPostal} value={form.zipCode} onChange={updField('zipCode')} required />
            <Field label={text.fieldCity} value={form.city} onChange={updField('city')} required />
            <Field label={text.fieldRegion} value={form.region} onChange={updField('region')} required />
            <Field label={text.fieldCountry} value={form.country} onChange={updField('country')} required />
            <Field className="sm:col-span-2" label={text.fieldMobile} value={form.mobilephone} onChange={updField('mobilephone')} type="tel" required />
          </div>
          {errorMessage ? (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button type="button" onClick={closeForm} className={GHOST_BTN}>
              {text.cancel}
            </button>
            <button type="submit" className={PRIMARY_BTN}>
              {text.save}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function PaymentsTab({ text }) {
  const { t } = useTranslation('account')
  const [methods, setMethods] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    brand: 'Visa',
    last4: '',
    expMonth: 12,
    expYear: new Date().getFullYear() + 3,
  })
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
      setForm({
        brand: 'Visa',
        last4: '',
        expMonth: 12,
        expYear: new Date().getFullYear() + 3,
      })
      reload()
    } catch (err) {
      setErrorMessage(err?.message ?? text.genericError)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('account.deletePaymentConfirm'))) return
    try {
      await deletePaymentMethod(id)
      reload()
    } catch (err) {
      setErrorMessage(err?.message ?? text.genericError)
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="grid gap-6">
      {!showForm ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t('account.paymentsIntro')}
            </p>
            <button type="button" onClick={() => setShowForm(true)} className={PRIMARY_BTN}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {text.addPayment}
            </button>
          </div>

          {methods.length === 0 ? (
            <EmptyState Icon={CreditCard} label={text.paymentsEmpty} />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {methods.map((pm) => (
                <li key={pm.id}>
                  <article className="rounded-xl border border-border bg-gradient-to-br from-background to-card p-5">
                    <header className="mb-4 flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold uppercase tracking-widest text-foreground/70">
                        {pm.brand ?? pm.provider}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(pm.id)}
                        aria-label={`${text.delete} ${pm.brand}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </header>
                    <p className="font-mono text-lg tabular-nums tracking-widest text-foreground/80">
                      •••• •••• •••• {pm.last4}
                    </p>
                    <p className="mt-3 font-mono text-xs tabular-nums text-muted-foreground">
                      EXP {String(pm.expMonth).padStart(2, '0')}/{String(pm.expYear).slice(-2)}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="max-w-xl rounded-xl border border-border bg-background p-5 lg:p-6"
        >
          <div className="mb-5 flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-semibold text-foreground">
              {t('account.newPaymentTitle')}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setErrorMessage('')
              }}
              aria-label={text.cancel}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <p className="mb-4 rounded-lg border border-border bg-card px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            {text.paymentsNote}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2 grid gap-1.5">
              <span className={LABEL_CLASSES.replace('mb-1.5 block ', '')}>
                {text.paymentBrand}
              </span>
              <select
                value={form.brand}
                onChange={(event) => setForm({ ...form, brand: event.target.value })}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Amex">American Express</option>
              </select>
            </label>
            <Field
              className="sm:col-span-2"
              label={text.paymentLast4}
              value={form.last4}
              onChange={(event) =>
                setForm({ ...form, last4: event.target.value.replace(/\D/g, '').slice(0, 4) })
              }
              required
            />
            <Field
              label={text.paymentMonth}
              type="number"
              value={form.expMonth}
              onChange={(event) => setForm({ ...form, expMonth: event.target.value })}
              required
            />
            <Field
              label={text.paymentYear}
              type="number"
              value={form.expYear}
              onChange={(event) => setForm({ ...form, expYear: event.target.value })}
              required
            />
          </div>

          {errorMessage ? (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setErrorMessage('')
              }}
              className={GHOST_BTN}
            >
              {text.cancel}
            </button>
            <button type="submit" className={PRIMARY_BTN}>
              {text.save}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}


