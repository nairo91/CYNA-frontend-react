import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import cynaLogo from '../assets/logo-icon-transparent.png'
import { siteText } from '../content/siteText'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const THEMES = [
  { id: 'dark', label: 'Sombre', icon: 'dark_mode' },
  { id: 'light', label: 'Clair', icon: 'light_mode' },
  { id: 'valentine', label: 'Valentine', icon: 'favorite' },
  { id: 'luxury', label: 'Luxury', icon: 'diamond' },
  { id: 'night', label: 'Night', icon: 'nights_stay' },
]

export function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const { itemCount } = useCart()
  
  // Theme management
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cyna-theme') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('cyna-theme', theme)
  }, [theme])

  const handleSearch = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const q = (formData.get('q') ?? '').toString().trim()
    if (q) navigate(`/products?q=${encodeURIComponent(q)}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const navLinkClassName = ({ isActive }) => (isActive ? 'active' : '')

  const renderSearchForm = () => (
    <form onSubmit={handleSearch} role="search" aria-label="Recherche CYNA" className="form-control hidden lg:block">
      <div className="input-group relative flex items-center">
        <input type="search" name="q" placeholder={siteText.nav.searchPlaceholder} aria-label="Rechercher sur CYNA" className="input input-bordered input-sm rounded-full w-full max-w-xs pr-10" />
        <button type="submit" className="btn btn-sm btn-circle btn-ghost absolute right-0">
          <span className="material-symbols-outlined text-lg">search</span>
        </button>
      </div>
    </form>
  )

  const greetingName = user?.firstname || user?.email || siteText.nav.greetingFallback

  return (
    <header className="navbar bg-base-200/80 backdrop-blur-md sticky top-0 z-50 border-b border-base-300 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <span className="material-symbols-outlined">menu</span>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-64 p-2 shadow-xl border border-base-300">
            {/* Search for mobile */}
            <li className="mb-2">
              <form onSubmit={handleSearch} className="flex gap-2 p-1">
                <input type="search" name="q" placeholder="Rechercher..." className="input input-bordered input-sm w-full" />
                <button type="submit" className="btn btn-sm btn-square btn-primary">
                  <span className="material-symbols-outlined text-sm">search</span>
                </button>
              </form>
            </li>
            <li className="menu-title">Menu</li>
            {siteText.nav.primaryLinks.map((link) => (
              <li key={link.to}><NavLink className={navLinkClassName} to={link.to}>{link.label}</NavLink></li>
            ))}
            <div className="divider my-1"></div>
            <li className="menu-title">Compte</li>
            {(isAuthenticated ? siteText.nav.mobileLinksAuth : siteText.nav.mobileLinksGuest).map((link) => {
              if (link.action === 'logout') {
                return <li key={link.label}><button onClick={handleLogout} className="text-error">{link.label}</button></li>
              }
              if (link.to) {
                return <li key={link.label}><Link to={link.to} state={link.state}>{link.label}</Link></li>
              }
              return <li key={link.label}><a href={link.href}>{link.label}</a></li>
            })}
          </ul>
        </div>
        <Link className="btn btn-ghost text-xl gap-3 px-2" to="/" aria-label={siteText.nav.brandLabel}>
          <img src={cynaLogo} alt="" className="w-8 h-8 object-contain" />
          <span className="font-bold tracking-wider hidden sm:block text-primary">{siteText.nav.brand}</span>
        </Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          {siteText.nav.primaryLinks.map((link) => (
            <li key={link.to}>
              <NavLink className={navLinkClassName} to={link.to}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-end gap-2 md:gap-4">
        {renderSearchForm()}
        
        {/* Theme Switcher */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle" title="Changer le thème">
            <span className="material-symbols-outlined">palette</span>
          </div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-box z-[1] mt-3 w-40 p-2 shadow-xl border border-base-300">
            <li className="menu-title">Thème</li>
            {THEMES.map((t) => (
              <li key={t.id}>
                <button 
                  className={`flex items-center gap-2 ${theme === t.id ? 'active' : ''}`}
                  onClick={() => setTheme(t.id)}
                >
                  <span className="material-symbols-outlined text-sm">{t.icon}</span>
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                <div className="bg-neutral text-neutral-content rounded-full w-10">
                  <span className="text-xl">{greetingName.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-200 rounded-box z-[1] mt-3 w-52 p-2 shadow-xl border border-base-300">
                <li className="menu-title truncate">{greetingName}</li>
                <li><Link to="/espace-client" className="justify-between">{siteText.nav.accountLabel} <span className="material-symbols-outlined text-sm">person</span></Link></li>
                <div className="divider my-0"></div>
                <li><button onClick={handleLogout} className="text-error justify-between">{siteText.nav.logoutLabel} <span className="material-symbols-outlined text-sm">logout</span></button></li>
              </ul>
            </div>
          ) : (
            siteText.nav.authLinks.map((link) => (
              link.to ? (
                <Link key={link.label} to={link.to} className={`btn btn-sm ${link.label.toLowerCase().includes('inscription') ? 'btn-primary' : 'btn-ghost'}`}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} className="btn btn-sm btn-ghost">{link.label}</a>
              )
            ))
          )}
        </div>

        {/* Cart */}
        <Link to="/panier" className="btn btn-ghost btn-circle" title={siteText.nav.cartHint}>
          <div className="indicator">
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            {itemCount > 0 && <span className="badge badge-sm badge-primary indicator-item">{itemCount}</span>}
          </div>
        </Link>
      </div>
    </header>
  )
}
