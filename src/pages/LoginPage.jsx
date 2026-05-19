import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api/http'
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [twoFactorChallenge, setTwoFactorChallenge] = useState(null)
  const [twoFactorCode, setTwoFactorCode] = useState('')

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
      const result = await login({
        email: formValues.email.trim(),
        password: formValues.password,
        rememberMe: formValues.rememberMe,
      })
      if (result?.requires2fa) {
        setTwoFactorChallenge(result)
        setSuccessMessage(
          result.method === 'email'
            ? page.twoFactorEmailSent
            : page.twoFactorRequired,
        )
        return
      }
      setSuccessMessage(page.success)
      window.setTimeout(() => navigate(redirectTo, { replace: true }), 500)
    } catch (error) {
      setErrorMessage(mapLoginApiError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTwoFactorSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      await verify2fa({
        email: formValues.email.trim(),
        password: formValues.password,
        code: twoFactorCode,
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
      <div className="mb-6">
        <a className="btn btn-outline w-full gap-3 shadow-sm hover:bg-base-200 hover:text-base-content hover:border-base-300" href={`${API_BASE_URL}/login/google`} role="button">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {page.google}
        </a>
      </div>

      <div className="divider text-base-content/50 text-sm mb-6">
        {page.divider}
      </div>

      <form className="flex flex-col gap-4" onSubmit={twoFactorChallenge ? handleTwoFactorSubmit : handleSubmit}>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">{page.emailLabel}</span>
          </label>
          <div className="input-group relative flex items-center">
            <span className="absolute left-3 material-symbols-outlined text-base-content/40">mail</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="votre@email.com"
              className="input input-bordered w-full pl-10 focus:border-primary transition-colors"
              value={formValues.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {!twoFactorChallenge ? (
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">{page.passwordLabel}</span>
            </label>
            <div className="input-group relative flex items-center">
              <span className="absolute left-3 material-symbols-outlined text-base-content/40">lock</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="input input-bordered w-full pl-10 focus:border-primary transition-colors"
                value={formValues.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        ) : (
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium text-primary">{page.twoFactorCodeLabel}</span>
            </label>
            <div className="input-group relative flex items-center">
              <span className="absolute left-3 material-symbols-outlined text-base-content/40">dialpad</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="123456"
                className="input input-bordered w-full pl-10 font-mono text-center tracking-[0.5em] text-lg focus:border-primary transition-colors"
                value={twoFactorCode}
                onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-2 mb-2">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              name="rememberMe"
              className="checkbox checkbox-sm checkbox-primary rounded"
              checked={formValues.rememberMe}
              onChange={handleChange}
            />
            <span className="label-text text-sm">{page.rememberMe}</span>
          </label>

          <Link className="link link-hover text-sm text-base-content/70" to="/forgot-password">
            {page.forgotPassword}
          </Link>
        </div>

        {errorMessage && (
          <div className="alert alert-error shadow-sm rounded-xl py-3 text-sm">
            <span className="material-symbols-outlined text-lg">error</span>
            <span>{errorMessage}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="alert alert-success shadow-sm rounded-xl py-3 text-sm text-success-content">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        <button className="btn btn-primary w-full shadow-md mt-2" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <span className="material-symbols-outlined mr-2">
              {twoFactorChallenge ? 'security' : 'login'}
            </span>
          )}
          {isSubmitting ? page.submitting : twoFactorChallenge ? page.twoFactorSubmit : page.submit}
        </button>
      </form>
    </AuthPageLayout>
  )
}
