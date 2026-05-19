import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import cynaLogo from '../assets/logo-icon-transparent.png'
import { siteText } from '../content/siteText'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const { itemCount } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

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

  const navLinkClassName = ({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')

  const renderSearchForm = (className) => (
    <form className={className} onSubmit={handleSearch} role="search" aria-label="Recherche CYNA">
      <input type="search" name="q" placeholder={siteText.nav.searchPlaceholder} aria-label="Rechercher sur CYNA" />
      <button className="nav-search-button" type="submit">{siteText.nav.searchButton}</button>
    </form>
  )

  const renderSecondaryLink = (link, className) => {
    if (link.to) {
      return <Link className={className} to={link.to} key={link.label}>{link.label}</Link>
    }
    return <a className={className} href={link.href} key={link.label}>{link.label}</a>
  }

  const greetingName = user?.firstname || user?.email || siteText.nav.greetingFallback

  const renderAuthArea = (className) =>
    isAuthenticated ? (
      <div className={className} key="auth-user">
        <Link className="nav-aux-link nav-aux-account" to="/espace-client" title={siteText.nav.accountHint}>
          {`${siteText.nav.accountLabel} - ${greetingName}`}
        </Link>
        <button className="nav-aux-link nav-aux-logout" type="button" onClick={handleLogout}>
          {siteText.nav.logoutLabel}
        </button>
      </div>
    ) : (
      <div className={className} key="auth-guest">
        {siteText.nav.authLinks.map((link) => renderSecondaryLink(link, 'nav-aux-link'))}
      </div>
    )

  const renderCartButton = (className) => (
    <Link className={className} to="/panier" title={siteText.nav.cartHint}>
      <span aria-hidden="true">+</span>
      {siteText.nav.cartLabel}
      {itemCount > 0 ? <span className="cart-badge">{itemCount}</span> : null}
    </Link>
  )

  return (
    <header className="nav">
      <div className="container nav-inner">
        <div className="nav-top">
          <div className="nav-start">
            <NavLink className="nav-brand" to="/" aria-label={siteText.nav.brandLabel}>
              <img src={cynaLogo} alt="" />
              <span>{siteText.nav.brand}</span>
            </NavLink>

            <nav className="nav-primary nav-primary-desktop" aria-label="Navigation principale">
              {siteText.nav.primaryLinks.map((link) => (
                <NavLink className={navLinkClassName} key={link.to} to={link.to}>{link.label}</NavLink>
              ))}
            </nav>
          </div>

          <div className="nav-end">
            {renderSearchForm('nav-search nav-search-desktop')}
            {renderAuthArea('nav-secondary-links nav-secondary-desktop')}
            {renderCartButton('cart-button cart-button-desktop')}

            <button
              className="nav-burger"
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls="primary-navigation"
              aria-label={isMenuOpen ? 'Fermer le menu principal' : 'Ouvrir le menu principal'}
              onClick={() => setIsMenuOpen((c) => !c)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        <div className={isMenuOpen ? 'nav-panel is-open' : 'nav-panel'} id="primary-navigation">
          {renderSearchForm('nav-search nav-search-mobile')}

          <nav className="nav-primary nav-primary-mobile" aria-label="Navigation principale mobile">
            {siteText.nav.primaryLinks.map((link) => (
              <NavLink className={navLinkClassName} key={link.to} to={link.to}>{link.label}</NavLink>
            ))}
          </nav>

          {renderAuthArea('nav-secondary-links nav-secondary-mobile')}
          {renderCartButton('cart-button cart-button-mobile')}

          <div className="nav-mobile-extra">
            {(isAuthenticated ? siteText.nav.mobileLinksAuth : siteText.nav.mobileLinksGuest).map((link) => {
              if (link.action === 'logout') {
                return (
                  <button
                    className="nav-mobile-link"
                    type="button"
                    key={link.label}
                    onClick={handleLogout}
                  >
                    {link.label}
                  </button>
                )
              }
              if (link.to) {
                return (
                  <Link
                    className="nav-mobile-link"
                    to={link.to}
                    state={link.state}
                    key={link.label}
                  >
                    {link.label}
                  </Link>
                )
              }
              return (
                <a className="nav-mobile-link" href={link.href} key={link.label}>
                  {link.label}
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}
