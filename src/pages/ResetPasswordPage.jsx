import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/authApi'
import { AuthPageLayout } from '../components/auth/AuthPageLayout'
import { siteText } from '../content/siteText'
import { isStrongPassword, PASSWORD_MIN_LENGTH } from '../utils/authValidation'

export function ResetPasswordPage() {
  const text = siteText.pages.resetPassword
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!token) {
      setErrorMessage(text.tokenMissing)
      return
    }
    if (!isStrongPassword(password)) {
      setErrorMessage(text.weakPassword.replace('{n}', PASSWORD_MIN_LENGTH))
      return
    }
    if (password !== confirm) {
      setErrorMessage(text.mismatch)
      return
    }

    setStatus('submitting')
    try {
      await resetPassword({ token, password })
      setStatus('done')
      window.setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err) {
      setErrorMessage(err?.message ?? text.genericError)
      setStatus('idle')
    }
  }

  return (
    <AuthPageLayout
      eyebrow={text.eyebrow}
      title={text.title}
      copy={text.copy}
      benefits={[]}
      cardTitle={text.cardTitle}
      cardCopy={text.cardCopy}
      footerPrompt={text.footerPrompt}
      footerActionLabel={text.footerAction}
      footerActionTo="/login"
    >
      {status === 'done' ? (
        <div className="auth-feedback auth-feedback-success">{text.success}</div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>{text.passwordLabel}</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label className="auth-field">
            <span>{text.confirmLabel}</span>
            <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </label>
          <p className="auth-helper">{text.helper.replace('{n}', PASSWORD_MIN_LENGTH)}</p>
          {errorMessage ? <div className="auth-feedback auth-feedback-error">{errorMessage}</div> : null}
          <button type="submit" className="button-primary auth-submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? text.submitting : text.submit}
          </button>
          <Link className="auth-text-link" to="/login">{text.back}</Link>
        </form>
      )}
    </AuthPageLayout>
  )
}
