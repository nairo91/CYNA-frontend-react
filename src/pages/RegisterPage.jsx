import { useState } from 'react'
import { API_BASE_URL } from '../api/http'
import { AuthPageLayout } from '../components/auth/AuthPageLayout'
import { siteText } from '../content/siteText'
import { useAuth } from '../context/AuthContext'
import {
  getRegisterValidationError,
  mapRegisterApiError,
} from '../utils/authValidation'

export function RegisterPage() {
  const { register } = useAuth()
  const page = siteText.auth.register
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
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setInfoMessage('')

    // We still pass formValues to getRegisterValidationError, but we need to ensure 
    // it validates firstname and lastname if we added logic there, otherwise it's fine
    const validationError = getRegisterValidationError({ 
      ...formValues, 
      fullName: `${formValues.firstname} ${formValues.lastname}`.trim() 
    })
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    if (!formValues.firstname.trim() || !formValues.lastname.trim()) {
      setErrorMessage('Veuillez renseigner votre prénom et votre nom.')
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
      benefits={siteText.auth.registerBenefits}
      cardTitle={page.cardTitle}
      cardCopy={page.cardCopy}
      footerPrompt={page.switchPrompt}
      footerActionLabel={page.switchAction}
      footerActionTo="/login"
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

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Prénom</span>
            </label>
            <div className="input-group relative flex items-center">
              <span className="absolute left-3 material-symbols-outlined text-base-content/40">badge</span>
              <input 
                type="text" 
                name="firstname" 
                placeholder="Jean"
                className="input input-bordered w-full pl-10 focus:border-primary transition-colors" 
                value={formValues.firstname} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Nom</span>
            </label>
            <div className="input-group relative flex items-center">
              <span className="absolute left-3 material-symbols-outlined text-base-content/40">badge</span>
              <input 
                type="text" 
                name="lastname" 
                placeholder="Dupont"
                className="input input-bordered w-full pl-10 focus:border-primary transition-colors" 
                value={formValues.lastname} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">{page.passwordLabel}</span>
            </label>
            <div className="input-group relative flex items-center">
              <span className="absolute left-3 material-symbols-outlined text-base-content/40">lock</span>
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className="input input-bordered w-full pl-10 focus:border-primary transition-colors"
                value={formValues.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">{page.confirmPasswordLabel}</span>
            </label>
            <div className="input-group relative flex items-center">
              <span className="absolute left-3 material-symbols-outlined text-base-content/40">lock_reset</span>
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="••••••••"
                className="input input-bordered w-full pl-10 focus:border-primary transition-colors"
                value={formValues.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-base-content/60 mt-1 mb-2 px-1 flex items-start gap-1">
          <span className="material-symbols-outlined text-[14px]">info</span>
          {page.passwordHelp}
        </p>

        {errorMessage && (
          <div className="alert alert-error shadow-sm rounded-xl py-3 text-sm">
            <span className="material-symbols-outlined text-lg">error</span>
            <span>{errorMessage}</span>
          </div>
        )}
        
        {infoMessage && (
          <div className="alert alert-info shadow-sm rounded-xl py-3 text-sm bg-info/10 text-info">
            <span className="material-symbols-outlined text-lg">info</span>
            <span>{infoMessage}</span>
          </div>
        )}

        <button className="btn btn-primary w-full shadow-md mt-2" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <span className="material-symbols-outlined mr-2">person_add</span>
          )}
          {isSubmitting ? page.submitting : page.submit}
        </button>
      </form>
    </AuthPageLayout>
  )
}
