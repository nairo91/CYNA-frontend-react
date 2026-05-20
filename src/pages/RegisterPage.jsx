import { useState } from 'react'
import { AlertCircle, Info, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { API_BASE_URL } from '../api/http'
import { AuthPageLayout } from '../components/auth/AuthPageLayout'
import { useAuth } from '../context/AuthContext'
import { getRegisterValidationError, mapRegisterApiError } from '../utils/authValidation'

const INPUT_CLASSES =
  'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40'

const LABEL_CLASSES =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground'

export function RegisterPage() {
  const { register } = useAuth()
  const { t } = useTranslation('auth')
  const page = t('register', { returnObjects: true })
  const registerBenefits = t('registerBenefits', { returnObjects: true })
  const [formValues, setFormValues] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setInfoMessage('')

    const validationError = getRegisterValidationError({
      ...formValues,
      fullName: `${formValues.firstname} ${formValues.lastname}`.trim(),
    })
    if (validationError) {
      setErrorMessage(validationError)
      return
    }
    if (!formValues.firstname.trim() || !formValues.lastname.trim()) {
      setErrorMessage(t('register.bothNamesRequired'))
      return
    }

    setIsSubmitting(true)
    try {
      await register({
        email: formValues.email.trim(),
        firstname: formValues.firstname.trim(),
        lastname: formValues.lastname.trim(),
        plainPassword: formValues.password,
      })
      setInfoMessage(page.info)
      setFormValues({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
    } catch (error) {
      setErrorMessage(mapRegisterApiError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageLayout
      eyebrow={page.eyebrow}
      title={page.title}
      copy={page.copy}
      benefits={registerBenefits}
      cardTitle={page.cardTitle}
      cardCopy={page.cardCopy}
      footerPrompt={page.switchPrompt}
      footerActionLabel={page.switchAction}
      footerActionTo="/login"
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

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-firstname" className={LABEL_CLASSES}>
              {page.firstnameLabel}
            </label>
            <input
              id="register-firstname"
              type="text"
              name="firstname"
              autoComplete="given-name"
              placeholder="Jean"
              value={formValues.firstname}
              onChange={handleChange}
              required
              className={INPUT_CLASSES}
            />
          </div>
          <div>
            <label htmlFor="register-lastname" className={LABEL_CLASSES}>
              {page.lastnameLabel}
            </label>
            <input
              id="register-lastname"
              type="text"
              name="lastname"
              autoComplete="family-name"
              placeholder="Dupont"
              value={formValues.lastname}
              onChange={handleChange}
              required
              className={INPUT_CLASSES}
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className={LABEL_CLASSES}>
            {page.emailLabel}
          </label>
          <input
            id="register-email"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-password" className={LABEL_CLASSES}>
              {page.passwordLabel}
            </label>
            <input
              id="register-password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={formValues.password}
              onChange={handleChange}
              required
              className={INPUT_CLASSES}
            />
          </div>
          <div>
            <label htmlFor="register-confirm" className={LABEL_CLASSES}>
              {page.confirmPasswordLabel}
            </label>
            <input
              id="register-confirm"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              value={formValues.confirmPassword}
              onChange={handleChange}
              required
              className={INPUT_CLASSES}
            />
          </div>
        </div>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          <span>{page.passwordHelp}</span>
        </p>

        {errorMessage ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {infoMessage ? (
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
          >
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{infoMessage}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? page.submitting : page.submit}
        </button>
      </form>
    </AuthPageLayout>
  )
}
