import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react'
import { requestPasswordReset } from '../api/authApi'
import { AuthPageLayout } from '../components/auth/AuthPageLayout'
import { siteText } from '../content/siteText'
import { isValidEmail } from '../utils/authValidation'

const INPUT_CLASSES =
  'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40'

const LABEL_CLASSES =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground'

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
      // On affiche le même succès même en cas d'erreur pour ne pas leaker.
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
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-3 text-sm text-emerald-300"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{text.success}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label htmlFor="forgot-email" className={LABEL_CLASSES}>
              {text.emailLabel}
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={INPUT_CLASSES}
            />
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
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {status === 'submitting' ? text.submitting : text.submit}
          </button>
          <Link
            to="/login"
            className="text-center text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:underline"
          >
            {text.back}
          </Link>
        </form>
      )}
    </AuthPageLayout>
  )
}
