import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Globe, LogOut, Menu, Moon, Search, ShoppingCart, Sun, User, X } from 'lucide-react'
import cynaLogo from '../assets/logo-icon-transparent.png'
import { siteText } from '../content/siteText'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { cn } from '../lib/utils'

const LANGUAGES = [
  { code: 'fr', label: 'Français', available: true },
  { code: 'en', label: 'English', available: false },
]

const DARK_THEMES = new Set(['dark', 'night', 'luxury'])

function readInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  return window.localStorage.getItem('cyna-theme') || 'dark'
}

export function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const { itemCount } = useCart()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [theme, setTheme] = useState(readInitialTheme)
  const [lang, setLang] = useState('fr')

  const sheetRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    setMobileOpen(false)
    setAccountOpen(false)
    setLangOpen(false)
  }, [pathname])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('dark', DARK_THEMES.has(theme))
    window.localStorage.setItem('cyna-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!mobileOpen && !accountOpen && !langOpen) return
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        setAccountOpen(false)
        setLangOpen(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [mobileOpen, accountOpen, langOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const firstFocusable = sheetRef.current?.querySelector(
      'a, button:not([disabled]), input:not([disabled])'
    )
    firstFocusable?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileOpen])

  const handleSearch = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = (formData.get('q') ?? '').toString().trim()
    if (query) {
      navigate(`/products?q=${encodeURIComponent(query)}`)
      setMobileOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    setAccountOpen(false)
    setMobileOpen(false)
    navigate('/', { replace: true })
  }

  const toggleTheme = () => {
    setTheme((current) => (DARK_THEMES.has(current) ? 'light' : 'dark'))
  }

  const greetingName =
    user?.firstname || user?.email || siteText.nav.greetingFallback
  const isDark = DARK_THEMES.has(theme)
  const mobileLinks = isAuthenticated
    ? siteText.nav.mobileLinksAuth
    : siteText.nav.mobileLinksGuest

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-[var(--page-max-width)] items-center gap-2 px-4 lg:gap-4 lg:px-6">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={siteText.nav.brandLabel}
          >
            <img src={cynaLogo} alt="" className="h-8 w-8 object-contain" />
            <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {siteText.nav.brand}
            </span>
          </Link>

          <nav className="ms-2 hidden lg:block" aria-label="Navigation principale">
            <ul className="flex items-center gap-1">
              {siteText.nav.primaryLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        isActive
                          ? 'bg-accent text-foreground'
                          : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <form
            onSubmit={handleSearch}
            role="search"
            aria-label="Recherche CYNA"
            className="ms-auto hidden max-w-sm flex-1 lg:block"
          >
            <div className="relative">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                name="q"
                placeholder={siteText.nav.searchPlaceholder}
                aria-label="Rechercher sur CYNA"
                className="h-10 w-full rounded-lg border border-border bg-background ps-10 pe-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>
          </form>

          <div className="ms-auto flex items-center gap-1 lg:ms-0 lg:gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setLangOpen((value) => !value)
                  setAccountOpen(false)
                }}
                aria-expanded={langOpen}
                aria-haspopup="menu"
                className="inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
                <span className="uppercase">{lang}</span>
              </button>
              {langOpen ? (
                <ul
                  role="menu"
                  className="absolute end-0 top-full z-50 mt-2 w-44 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
                >
                  {LANGUAGES.map((language) => (
                    <li key={language.code} role="none">
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={lang === language.code}
                        aria-disabled={!language.available}
                        disabled={!language.available}
                        onClick={() => {
                          if (language.available) {
                            setLang(language.code)
                            setLangOpen(false)
                          }
                        }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors focus:outline-none',
                          language.available
                            ? 'hover:bg-accent focus:bg-accent'
                            : 'cursor-not-allowed text-muted-foreground',
                          lang === language.code && 'font-medium text-foreground'
                        )}
                      >
                        <span>{language.label}</span>
                        {!language.available ? (
                          <span className="text-xs">bientôt</span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Passer en thème clair' : 'Passer en thème sombre'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isDark ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen((value) => !value)
                    setLangOpen(false)
                  }}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold uppercase text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span aria-hidden="true">{greetingName.charAt(0)}</span>
                  <span className="sr-only">Ouvrir le menu compte</span>
                </button>
                {accountOpen ? (
                  <ul
                    role="menu"
                    className="absolute end-0 top-full z-50 mt-2 w-56 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
                  >
                    <li className="px-2.5 py-1.5 text-xs text-muted-foreground">
                      {greetingName}
                    </li>
                    <li role="none">
                      <Link
                        to="/espace-client"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
                      >
                        <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        {siteText.nav.accountLabel}
                      </Link>
                    </li>
                    <li className="my-1 h-px bg-border" role="separator" />
                    <li role="none">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 focus:bg-destructive/10 focus:outline-none"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        {siteText.nav.logoutLabel}
                      </button>
                    </li>
                  </ul>
                ) : null}
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                {siteText.nav.authLinks.map((link) => {
                  const isPrimary = link.label.toLowerCase().includes('inscri')
                  return (
                    <Link
                      key={link.label}
                      to={link.to}
                      className={cn(
                        'inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-all duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        isPrimary
                          ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                          : 'text-foreground/80 hover:bg-accent hover:text-foreground'
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            )}

            <Link
              to="/panier"
              aria-label={`${siteText.nav.cartHint}${
                itemCount > 0 ? `, ${itemCount} article${itemCount > 1 ? 's' : ''}` : ''
              }`}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {itemCount > 0 ? (
                <span
                  className="absolute -end-0.5 -top-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-semibold tabular-nums text-primary-foreground"
                  aria-hidden="true"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            tabIndex={-1}
            onClick={() => setMobileOpen(false)}
            className="animate-in fade-in-0 fixed inset-0 z-40 cursor-default bg-background/80 backdrop-blur-sm duration-200 ease-out lg:hidden"
          />
          <div
            ref={sheetRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
            className="animate-in slide-in-from-right fixed inset-y-0 end-0 z-50 flex w-full max-w-sm flex-col gap-6 overflow-y-auto border-s border-border bg-card p-6 text-card-foreground shadow-xl duration-300 ease-out lg:hidden"
          >
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={siteText.nav.brandLabel}
                onClick={() => setMobileOpen(false)}
              >
                <img src={cynaLogo} alt="" className="h-7 w-7 object-contain" />
                <span className="text-lg font-semibold tracking-tight">
                  {siteText.nav.brand}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Fermer le menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSearch} role="search" aria-label="Recherche">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  name="q"
                  placeholder={siteText.nav.searchPlaceholder}
                  aria-label="Rechercher sur CYNA"
                  className="h-11 w-full rounded-lg border border-border bg-background ps-10 pe-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
            </form>

            <nav aria-label="Navigation principale">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Menu
              </p>
              <ul className="space-y-1">
                {siteText.nav.primaryLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      end={link.to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isActive
                            ? 'bg-accent text-foreground'
                            : 'text-foreground/80 hover:bg-accent hover:text-foreground'
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Compte">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isAuthenticated ? 'Mon compte' : 'Mon espace'}
              </p>
              <ul className="space-y-1">
                {mobileLinks.map((link) => {
                  if (link.action === 'logout') {
                    return (
                      <li key={link.label}>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <LogOut className="h-4 w-4" aria-hidden="true" />
                          {link.label}
                        </button>
                      </li>
                    )
                  }
                  if (link.to) {
                    return (
                      <li key={link.label}>
                        <Link
                          to={link.to}
                          state={link.state}
                          className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {link.label}
                        </Link>
                      </li>
                    )
                  }
                  return null
                })}
              </ul>
            </nav>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
              <div className="inline-flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {lang}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Passer en thème clair' : 'Passer en thème sombre'}
                className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {isDark ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{isDark ? 'Clair' : 'Sombre'}</span>
              </button>
            </div>
          </div>
        </>
      ) : null}

      {(accountOpen || langOpen) && (
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          onClick={() => {
            setAccountOpen(false)
            setLangOpen(false)
          }}
          className="fixed inset-0 z-30 cursor-default bg-transparent"
        />
      )}
    </>
  )
}
