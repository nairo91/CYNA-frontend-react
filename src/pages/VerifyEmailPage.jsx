import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { resendVerificationEmail, verifyEmail } from '../api/authApi'
import { siteText } from '../content/siteText'

const INPUT_CLASSES =
  'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40'

export function VerifyEmailPage() {
  const text = siteText.pages.verifyEmail
  const [params] = useSearchParams()
  const token = params.get('token')
  const emailFromUrl = params.get('email')
  const [status, setStatus] = useState('pending')
  const [resendEmail, setResendEmail] = useState(emailFromUrl ?? '')
  const [resendStatus, setResendStatus] = useState('idle')
  const [resendMessage, setResendMessage] = useState('')

  useEffect(() => {
    if (!token || !emailFromUrl) {
      setStatus('error')
      return
    }
    verifyEmail({ email: emailFromUrl, token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token, emailFromUrl])

  const handleResend = async (event) => {
    event.preventDefault()
    setResendMessage('')
    if (!resendEmail) return
    setResendStatus('sending')
    try {
      await resendVerificationEmail({ email: resendEmail.trim() })
      setResendStatus('success')
      setResendMessage(text.resendSuccess)
    } catch {
      setResendStatus('error')
      setResendMessage(text.resendError)
    }
  }

  const StatusIcon =
    status === 'pending' ? Loader2 : status === 'success' ? ShieldCheck : AlertCircle
  const statusTitle =
    status === 'pending'
      ? text.titlePending
      : status === 'success'
        ? text.titleSuccess
        : text.titleError
  const statusCopy =
    status === 'pending'
      ? text.copyPending
      : status === 'success'
        ? text.copySuccess
        : text.copyError

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div
          className={
            status === 'pending'
              ? 'mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary'
              : status === 'success'
                ? 'mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300'
                : 'mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive'
          }
        >
          <StatusIcon
            className={status === 'pending' ? 'h-6 w-6 motion-safe:animate-spin' : 'h-6 w-6'}
            aria-hidden="true"
          />
        </div>
        <span className="mt-4 inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {text.eyebrow}
        </span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
          {statusTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{statusCopy}</p>

        {status === 'success' ? (
          <Link
            to="/login"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {text.toLogin}
          </Link>
        ) : null}

        {status === 'error' ? (
          <form onSubmit={handleResend} className="mt-6 grid gap-3 text-start">
            <label
              htmlFor="resend-email"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {text.resendEmailLabel}
            </label>
            <input
              id="resend-email"
              type="email"
              autoComplete="email"
              required
              value={resendEmail}
              onChange={(event) => setResendEmail(event.target.value)}
              placeholder="votre@email.com"
              className={INPUT_CLASSES}
            />
            <button
              type="submit"
              disabled={resendStatus === 'sending'}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {resendStatus === 'sending' ? (
                <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              {resendStatus === 'sending' ? text.resendSending : text.resendCta}
            </button>
            {resendMessage ? (
              <div
                role={resendStatus === 'success' ? 'status' : 'alert'}
                className={
                  resendStatus === 'success'
                    ? 'flex items-start gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300'
                    : 'flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'
                }
              >
                {resendStatus === 'success' ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                ) : (
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                )}
                <span>{resendMessage}</span>
              </div>
            ) : null}
            <Link
              to="/login"
              className="mt-2 text-center text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:underline"
            >
              {text.toLogin}
            </Link>
          </form>
        ) : null}
      </div>
    </div>
  )
}
