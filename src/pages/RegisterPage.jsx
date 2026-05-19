import { useState } from 'react'
import { API_BASE_URL } from '../api/http'
import { AuthPageLayout } from '../components/auth/AuthPageLayout'
import { siteText } from '../content/siteText'
import { useAuth } from '../context/AuthContext'
import {
  getRegisterValidationError,
  mapRegisterApiError,
  splitFullName,
} from '../utils/authValidation'

export function RegisterPage() {
  const { register } = useAuth()
  const page = siteText.auth.register
  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setInfoMessage('')

    const validationError = getRegisterValidationError(formValues)
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    const { firstname, lastname } = splitFullName(formValues.fullName)
    if (!firstname || !lastname) {
      setErrorMessage('Veuillez renseigner votre prenom ET votre nom.')
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        email: formValues.email.trim(),
        firstname,
        lastname,
        plainPassword: formValues.password,
      })
      setInfoMessage(page.info)
      setFormValues({
        fullName: '',
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
      benefits={siteText.auth.registerBenefits}
      cardTitle={page.cardTitle}
      cardCopy={page.cardCopy}
      footerPrompt={page.switchPrompt}
      footerActionLabel={page.switchAction}
      footerActionTo="/login"
    >
      <div className="auth-provider-group">
        <a className="auth-provider-button" href={`${API_BASE_URL}/login/google`} role="button">
          {page.google}
        </a>
      </div>

      <div className="auth-divider">
        <span>{page.divider}</span>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>{page.fullNameLabel}</span>
          <input type="text" name="fullName" value={formValues.fullName} onChange={handleChange} required />
        </label>

        <label className="auth-field">
          <span>{page.emailLabel}</span>
          <input type="email" name="email" autoComplete="email" value={formValues.email} onChange={handleChange} required />
        </label>

        <div className="auth-form-grid">
          <label className="auth-field">
            <span>{page.passwordLabel}</span>
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              value={formValues.password}
              onChange={handleChange}
              required
            />
          </label>

          <label className="auth-field">
            <span>{page.confirmPasswordLabel}</span>
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={formValues.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <p className="auth-helper">{page.passwordHelp}</p>

        {errorMessage ? <div className="auth-feedback auth-feedback-error">{errorMessage}</div> : null}
        {infoMessage ? <div className="auth-feedback auth-feedback-info">{infoMessage}</div> : null}

        <button className="button-primary auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? page.submitting : page.submit}
        </button>
      </form>
    </AuthPageLayout>
  )
}
