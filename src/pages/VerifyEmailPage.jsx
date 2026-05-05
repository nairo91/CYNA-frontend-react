import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../api/authApi'
import { siteText } from '../content/siteText'

export function VerifyEmailPage() {
  const text = siteText.pages.verifyEmail
  const [params] = useSearchParams()
  const token = params.get('token')
  const email = params.get('email')
  const [status, setStatus] = useState('pending') // pending | success | error

  useEffect(() => {
    if (!token || !email) {
      setStatus('error')
      return
    }
    verifyEmail({ email, token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token, email])

  return (
    <section className="section">
      <div className="container">
        <div className="placeholder-card panel">
          <span className="eyebrow">{text.eyebrow}</span>
          <h1 className="section-title">
            {status === 'pending' ? text.titlePending : status === 'success' ? text.titleSuccess : text.titleError}
          </h1>
          <p className="section-copy">
            {status === 'pending' ? text.copyPending : status === 'success' ? text.copySuccess : text.copyError}
          </p>
          <div className="hero-actions">
            <Link className="button-primary" to="/login">{text.toLogin}</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
