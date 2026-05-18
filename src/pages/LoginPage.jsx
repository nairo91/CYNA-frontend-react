import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthPageLayout } from '../components/auth/AuthPageLayout'
import { siteText } from '../content/siteText'
import { useAuth } from '../context/AuthContext'
import { getLoginValidationError, mapLoginApiError } from '../utils/authValidation'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, verify2fa } = useAuth()
  const page = siteText.auth.login
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [show2faForm, setShow2faForm] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Si l'utilisateur a été redirigé par <ProtectedRoute>, on revient à la page d'origine.
  const redirectTo = location.state?.from?.pathname ?? '/espace-client'

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setFormValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (show2faForm) {
      if (!verificationCode || verificationCode.length !== 6) {
        setErrorMessage('Veuillez saisir un code à 6 chiffres.')
        return
      }
      setIsSubmitting(true)
      try {
        await verify2fa({
          email: formValues.email.trim(),
          password: formValues.password,
          code: verificationCode,
          rememberMe: formValues.rememberMe,
        })
        setSuccessMessage(page.success)
        window.setTimeout(() => navigate(redirectTo, { replace: true }), 500)
      } catch (error) {
        setErrorMessage(error?.message ?? 'Code 2FA invalide.')
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    const validationError = getLoginValidationError(formValues)
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      const res = await login({
        email: formValues.email.trim(),
        password: formValues.password,
        rememberMe: formValues.rememberMe,
      })
      if (res?.requires2fa) {
        setShow2faForm(true)
        setSuccessMessage("Code 2FA requis. Saisissez le code de sécurité.")
      } else {
        setSuccessMessage(page.success)
        window.setTimeout(() => navigate(redirectTo, { replace: true }), 500)
      }
    } catch (error) {
      setErrorMessage(mapLoginApiError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageLayout
      eyebrow={page.eyebrow}
      title={page.title}
      copy={page.copy}
      benefits={siteText.auth.loginBenefits}
      cardTitle={show2faForm ? "Validation de sécurité" : page.cardTitle}
      cardCopy={show2faForm ? "Double Authentification (2FA)" : page.cardCopy}
      footerPrompt={show2faForm ? "" : page.switchPrompt}
      footerActionLabel={show2faForm ? "" : page.switchAction}
      footerActionTo="/register"
    >
      {show2faForm ? (
        <form className="auth-form" onSubmit={handleSubmit}>
          <p className="section-copy" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            Saisissez le code de sécurité généré par votre application d'authentification (Google Authenticator, Authy, etc.).
          </p>

          <label className="auth-field">
            <span>Code de sécurité 2FA</span>
            <input
              type="text"
              name="verificationCode"
              maxLength={6}
              placeholder="000000"
              style={{ textAlign: 'center', letterSpacing: '0.25em', fontSize: '1.6rem', fontWeight: 'bold' }}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
            />
          </label>

          {errorMessage ? <div className="auth-feedback auth-feedback-error">{errorMessage}</div> : null}
          {successMessage ? <div className="auth-feedback auth-feedback-success">{successMessage}</div> : null}

          <button className="button-primary auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Vérification...' : 'Valider le code'}
          </button>

          <button
            type="button"
            className="button-secondary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            onClick={() => {
              setShow2faForm(false)
              setVerificationCode('')
              setErrorMessage('')
              setSuccessMessage('')
            }}
          >
            Retour à la connexion
          </button>
        </form>
      ) : (
        <>
          <div className="auth-provider-group">
            <button className="auth-provider-button" type="button" disabled title={page.googleHint}>
              {page.google}
            </button>
            <p className="auth-provider-note">{page.googleStatus}</p>
          </div>

          <div className="auth-divider">
            <span>{page.divider}</span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>{page.emailLabel}</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={formValues.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="auth-field">
              <span>{page.passwordLabel}</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={formValues.password}
                onChange={handleChange}
                required
              />
            </label>

            <div className="auth-meta-row">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formValues.rememberMe}
                  onChange={handleChange}
                />
                <span>{page.rememberMe}</span>
              </label>

              <Link className="auth-text-link" to="/forgot-password">
                {page.forgotPassword}
              </Link>
            </div>

            {errorMessage ? <div className="auth-feedback auth-feedback-error">{errorMessage}</div> : null}
            {successMessage ? <div className="auth-feedback auth-feedback-success">{successMessage}</div> : null}

            <button className="button-primary auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? page.submitting : page.submit}
            </button>
          </form>
        </>
      )}
    </AuthPageLayout>
  )
}
