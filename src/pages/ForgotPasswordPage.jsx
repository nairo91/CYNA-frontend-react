import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../api/authApi'
import { AuthPageLayout } from '../components/auth/AuthPageLayout'
import { siteText } from '../content/siteText'
import { isValidEmail } from '../utils/authValidation'

export function ForgotPasswordPage() {
  const text = siteText.pages.forgotPassword
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    if (!isValidEmail(email)) {
      setErrorMessage(text.invalidEmail)
      return
    }
    setStatus('submitting')
    try {
      await requestPasswordReset(email.trim())
      setStatus('done')
    } catch {
      // Volontaire : on affiche le même message succès même en cas d'erreur (ne pas leaker l'existence du compte).
      setStatus('done')
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
            <span>{text.emailLabel}</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
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
