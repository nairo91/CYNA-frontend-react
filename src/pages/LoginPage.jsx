import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, LogIn } from 'lucide-react'
import { API_BASE_URL } from '../api/http'
import { AuthPageLayout } from '../components/auth/AuthPageLayout'
import { siteText } from '../content/siteText'
import { useAuth } from '../context/AuthContext'
import { getLoginValidationError, mapLoginApiError } from '../utils/authValidation'

const INPUT_CLASSES =
  'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40'

const LABEL_CLASSES =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground'

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
          result.method === 'email' ? page.twoFactorEmailSent : page.twoFactorRequired
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
      <a
        href={`${API_BASE_URL}/login/google`}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {page.google}
      </a>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span className="uppercase tracking-wider">{page.divider}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form
        onSubmit={twoFactorChallenge ? handleTwoFactorSubmit : handleSubmit}
        className="grid gap-4"
      >
        <div>
          <label htmlFor="login-email" className={LABEL_CLASSES}>
            {page.emailLabel}
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="votre@email.com"
            value={formValues.email}
            onChange={handleChange}
            required
            className={INPUT_CLASSES}
          />
        </div>

        {!twoFactorChallenge ? (
          <div>
            <label htmlFor="login-password" className={LABEL_CLASSES}>
              {page.passwordLabel}
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={formValues.password}
              onChange={handleChange}
              required
              className={INPUT_CLASSES}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="login-2fa" className={LABEL_CLASSES}>
              {page.twoFactorCodeLabel}
            </label>
            <input
              id="login-2fa"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="123456"
              value={twoFactorCode}
              onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, ''))}
              required
              className="h-12 w-full rounded-lg border border-border bg-background px-3 text-center font-mono text-lg tracking-[0.5em] text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formValues.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {page.rememberMe}
          </label>
          <Link
            to="/forgot-password"
            className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {page.forgotPassword}
          </Link>
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {successMessage ? (
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          {isSubmitting
            ? page.submitting
            : twoFactorChallenge
              ? page.twoFactorSubmit
              : page.submit}
        </button>
      </form>
    </AuthPageLayout>
  )
}
