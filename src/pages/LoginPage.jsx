import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthPageLayout } from '../components/auth/AuthPageLayout'
import { siteText } from '../content/siteText'
import { useAuth } from '../context/AuthContext'
import { getLoginValidationError, mapLoginApiError } from '../utils/authValidation'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const page = siteText.auth.login
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
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

    const validationError = getLoginValidationError(formValues)
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      await login({
        email: formValues.email.trim(),
        password: formValues.password,
        rememberMe: formValues.rememberMe,
      })
      setSuccessMessage(page.success)
      window.setTimeout(() => navigate(redirectTo, { replace: true }), 500)
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
      cardTitle={page.cardTitle}
      cardCopy={page.cardCopy}
      footerPrompt={page.switchPrompt}
      footerActionLabel={page.switchAction}
      footerActionTo="/register"
    >
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
    </AuthPageLayout>
  )
}
