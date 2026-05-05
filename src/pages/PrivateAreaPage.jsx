import { Link, useNavigate } from 'react-router-dom'
import { siteText } from '../content/siteText'
import { useAuth } from '../context/AuthContext'

export function PrivateAreaPage() {
  const page = siteText.pages.privateArea
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const greeting = user?.firstname ? `${page.title}, ${user.firstname}` : page.title
  const roles = Array.isArray(user?.roles) ? user.roles.join(', ') : '—'
  const isVerified = user?.isVerified ? page.identityVerifiedYes : page.identityVerifiedNo

  return (
    <section className="section page-placeholder">
      <div className="container">
        <div className="placeholder-card panel">
          <span className="eyebrow">{page.eyebrow}</span>
          <h1 className="section-title placeholder-title">{greeting}</h1>
          <p className="section-copy placeholder-copy">{page.copy}</p>

          {user ? (
            <div className="account-identity">
              <h2 className="account-identity-title">{page.identityTitle}</h2>
              <dl className="account-identity-grid">
                <div>
                  <dt>{page.identityFirstname}</dt>
                  <dd>{user.firstname || '—'}</dd>
                </div>
                <div>
                  <dt>{page.identityLastname}</dt>
                  <dd>{user.lastname || '—'}</dd>
                </div>
                <div>
                  <dt>{page.identityEmail}</dt>
                  <dd>{user.email || '—'}</dd>
                </div>
                <div>
                  <dt>{page.identityRoles}</dt>
                  <dd>{roles}</dd>
                </div>
                <div>
                  <dt>{page.identityVerified}</dt>
                  <dd>{isVerified}</dd>
                </div>
              </dl>
            </div>
          ) : null}

          <div className="hero-actions">
            <Link className="button-primary" to="/">
              {page.cta}
            </Link>
            <button className="button-secondary" type="button" onClick={handleLogout}>
              {page.logoutLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
