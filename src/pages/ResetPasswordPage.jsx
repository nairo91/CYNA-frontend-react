import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, KeyRound } from 'lucide-react'
import { resetPassword } from '../api/authApi'
import { AuthPageLayout } from '../components/auth/AuthPageLayout'
import { siteText } from '../content/siteText'
import { isStrongPassword, PASSWORD_MIN_LENGTH } from '../utils/authValidation'

const INPUT_CLASSES =
  'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40'

const LABEL_CLASSES =
  'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground'

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
            <label htmlFor="reset-password" className={LABEL_CLASSES}>
              {text.passwordLabel}
            </label>
            <input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={INPUT_CLASSES}
            />
          </div>
          <div>
            <label htmlFor="reset-confirm" className={LABEL_CLASSES}>
              {text.confirmLabel}
            </label>
            <input
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className={INPUT_CLASSES}
            />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {text.helper.replace('{n}', PASSWORD_MIN_LENGTH)}
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
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
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
