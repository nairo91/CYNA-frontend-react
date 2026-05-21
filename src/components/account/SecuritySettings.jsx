/* eslint-disable react/prop-types */
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Mail,
  Shield,
  ShieldCheck,
  ShieldOff,
  Smartphone,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { apiPost } from '../../api/http'
import { cn } from '../../lib/utils'

const PRIMARY_BTN =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card'

const GHOST_BTN =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card'

const DANGER_BTN =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-destructive px-4 text-sm font-medium text-destructive-foreground shadow-sm transition-all duration-150 hover:bg-destructive/90 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card'

const CODE_INPUT =
  'h-12 w-full max-w-[12rem] rounded-lg border border-border bg-background px-4 text-center font-mono text-xl font-semibold tracking-[0.4em] tabular-nums text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40'

function Feedback({ tone, children }) {
  if (!children) return null
  const Icon = tone === 'success' ? CheckCircle2 : AlertCircle
  return (
    <div
      role={tone === 'success' ? 'status' : 'alert'}
      className={cn(
        'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
        tone === 'success'
          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
          : 'border-destructive/30 bg-destructive/10 text-destructive'
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

function StatusPill({ active, activeLabel, inactiveLabel }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        active
          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
          : 'border-border bg-background text-muted-foreground'
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          active ? 'bg-emerald-400' : 'bg-muted-foreground/40'
        )}
      />
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}

function SectionCard({ icon: Icon, title, status, children }) {
  return (
    <section className="rounded-2xl border border-border bg-background p-5 lg:p-6">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h3>
        </div>
        {status ? <div className="flex-shrink-0">{status}</div> : null}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export default function SecuritySettings({ currentUser, onUserUpdate }) {
  const { t } = useTranslation('account')
  const text = t('security', { returnObjects: true })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [isEnabling, setIsEnabling] = useState(false)
  const [setupData, setSetupData] = useState(null)
  const [verificationCode, setVerificationCode] = useState('')

  const [isTesting, setIsTesting] = useState(false)
  const [testCode, setTestCode] = useState('')
  const [testSuccess, setTestSuccess] = useState('')
  const [testError, setTestError] = useState('')

  const [emailCode, setEmailCode] = useState('')
  const [emailSetupStarted, setEmailSetupStarted] = useState(false)
  const [isEmailActionLoading, setIsEmailActionLoading] = useState(false)

  const resetGlobalFeedback = () => {
    setError('')
    setSuccess('')
  }

  const startSetup = async () => {
    resetGlobalFeedback()
    try {
      const data = await apiPost('/api/security/2fa/setup')
      setSetupData(data)
      setIsEnabling(true)
    } catch (err) {
      setError(text.totpSetupError)
    }
  }

  const confirmEnable = async (event) => {
    event.preventDefault()
    resetGlobalFeedback()
    try {
      await apiPost('/api/security/2fa/enable', { code: verificationCode })
      setSuccess(text.totpEnabled)
      setIsEnabling(false)
      setSetupData(null)
      setVerificationCode('')
      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      setError(text.totpInvalidCode)
    }
  }

  const handleToggleLogin = async () => {
    resetGlobalFeedback()
    try {
      const nextState = !currentUser.totpEnabled
      await apiPost('/api/security/2fa/toggle-login', { enabled: nextState })
      setSuccess(nextState ? text.totpToggleLoginEnabled : text.totpToggleLoginDisabled)
      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      setError(text.totpToggleLoginError)
    }
  }

  const runTestCode = async (event) => {
    event.preventDefault()
    setTestError('')
    setTestSuccess('')
    try {
      await apiPost('/api/security/2fa/test', { code: testCode })
      setTestSuccess(text.totpTestSuccess)
      setTestCode('')
    } catch (err) {
      setTestError(text.totpTestError)
    }
  }

  const disable2FA = async () => {
    if (!window.confirm(text.totpDisableConfirm)) return
    resetGlobalFeedback()
    setIsTesting(false)
    try {
      await apiPost('/api/security/2fa/disable')
      setSuccess(text.totpDisabled)
      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      setError(text.totpDisableError)
    }
  }

  const startEmail2FASetup = async () => {
    resetGlobalFeedback()
    setIsEmailActionLoading(true)
    try {
      await apiPost('/api/security/2fa/email/setup')
      setEmailSetupStarted(true)
      setSuccess(text.emailCodeSent)
    } catch (err) {
      setError(text.emailSendError)
    } finally {
      setIsEmailActionLoading(false)
    }
  }

  const enableEmail2FA = async (event) => {
    event.preventDefault()
    resetGlobalFeedback()
    setIsEmailActionLoading(true)
    try {
      await apiPost('/api/security/2fa/email/enable', { code: emailCode })
      setSuccess(text.emailEnabled)
      setEmailCode('')
      setEmailSetupStarted(false)
      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      setError(text.emailEnableError)
    } finally {
      setIsEmailActionLoading(false)
    }
  }

  const disableEmail2FA = async () => {
    resetGlobalFeedback()
    setIsEmailActionLoading(true)
    try {
      await apiPost('/api/security/2fa/email/disable')
      setSuccess(text.emailDisabled)
      setEmailCode('')
      setEmailSetupStarted(false)
      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      setError(text.emailDisableError)
    } finally {
      setIsEmailActionLoading(false)
    }
  }

  const toggleLoginNotifications = async () => {
    resetGlobalFeedback()
    try {
      const nextState = !currentUser.loginNotificationEnabled
      await apiPost('/api/security/2fa/login-notifications/toggle', { enabled: nextState })
      setSuccess(nextState ? text.loginAlertsEnabled : text.loginAlertsDisabled)
      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      setError(text.loginAlertsToggleError)
    }
  }

  const sendLoginNotificationTest = async () => {
    resetGlobalFeedback()
    try {
      await apiPost('/api/security/2fa/login-notifications/test')
      setSuccess(text.loginAlertsTestSent)
    } catch (err) {
      setError(text.loginAlertsTestError)
    }
  }

  return (
    <div className="grid gap-6">
      <p className="text-sm leading-relaxed text-muted-foreground">{text.intro}</p>

      <Feedback tone="error">{error}</Feedback>
      <Feedback tone="success">{success}</Feedback>

      <SectionCard
        icon={Mail}
        title={text.emailTitle}
        status={
          <StatusPill
            active={Boolean(currentUser.emailTwoFactorEnabled)}
            activeLabel={text.statusEnabled}
            inactiveLabel={text.statusDisabled}
          />
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          {text.emailDescription}
        </p>

        {!currentUser.emailTwoFactorEnabled ? (
          <div className="grid gap-3">
            <div>
              <button
                type="button"
                onClick={startEmail2FASetup}
                disabled={isEmailActionLoading}
                className={PRIMARY_BTN}
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {text.emailSendCode}
              </button>
            </div>

            {emailSetupStarted ? (
              <form onSubmit={enableEmail2FA} className="grid gap-3">
                <label htmlFor="email-2fa-code" className="sr-only">
                  {text.codeInputLabel}
                </label>
                <input
                  id="email-2fa-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength="6"
                  placeholder={text.emailCodePlaceholder}
                  value={emailCode}
                  onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, ''))}
                  required
                  className={CODE_INPUT}
                />
                <div>
                  <button type="submit" disabled={isEmailActionLoading} className={PRIMARY_BTN}>
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    {text.emailEnable}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={disableEmail2FA}
              disabled={isEmailActionLoading}
              className={DANGER_BTN}
            >
              <ShieldOff className="h-4 w-4" aria-hidden="true" />
              {text.emailDisable}
            </button>
          </div>
        )}
      </SectionCard>

      <SectionCard icon={Shield} title={text.loginAlertsTitle}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {text.loginAlertsDescription}
        </p>

        <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-sm text-foreground transition-colors hover:bg-accent">
          <input
            type="checkbox"
            checked={Boolean(currentUser.loginNotificationEnabled)}
            onChange={toggleLoginNotifications}
            className="mt-0.5 h-4 w-4 cursor-pointer rounded border-border bg-background text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="leading-snug">{text.loginAlertsToggleLabel}</span>
        </label>

        <div>
          <button type="button" onClick={sendLoginNotificationTest} className={GHOST_BTN}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            {text.loginAlertsTest}
          </button>
        </div>
      </SectionCard>

      <SectionCard
        icon={Smartphone}
        title={text.totpTitle}
        status={
          <StatusPill
            active={Boolean(currentUser.isTotpConfigured)}
            activeLabel={text.statusConfigured}
            inactiveLabel={text.statusNotConfigured}
          />
        }
      >
        {!currentUser.isTotpConfigured && !isEnabling ? (
          <div className="grid gap-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {text.totpNotConfiguredCopy}
            </p>
            <div>
              <button type="button" onClick={startSetup} className={PRIMARY_BTN}>
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                {text.totpSetupCta}
              </button>
            </div>
          </div>
        ) : null}

        {isEnabling && setupData ? (
          <div className="grid gap-4 rounded-xl border border-border bg-card p-4 lg:p-5">
            <h4 className="text-sm font-semibold tracking-tight text-foreground">
              {text.totpSetupHeading}
            </h4>
            <p className="text-sm text-muted-foreground">{text.totpScanInstruction}</p>
            <div className="flex justify-center rounded-lg border border-border bg-white p-4">
              <QRCodeSVG value={setupData.qrCodeContent} size={200} />
            </div>
            <p className="text-sm text-muted-foreground">
              {text.totpManualInstruction}{' '}
              <code className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-xs text-foreground">
                {setupData.secret}
              </code>
            </p>

            <form onSubmit={confirmEnable} className="grid gap-3">
              <label htmlFor="totp-setup-code" className="text-sm text-muted-foreground">
                {text.totpConfirmInstruction}
              </label>
              <input
                id="totp-setup-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength="6"
                placeholder="000000"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ''))}
                required
                className={CODE_INPUT}
              />
              <div className="flex flex-wrap items-center gap-2">
                <button type="submit" className={PRIMARY_BTN}>
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  {text.totpConfirm}
                </button>
                <button
                  type="button"
                  className={GHOST_BTN}
                  onClick={() => {
                    setIsEnabling(false)
                    setSetupData(null)
                    setVerificationCode('')
                  }}
                >
                  {text.cancel}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {currentUser.isTotpConfigured ? (
          <div className="grid gap-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {text.totpConfiguredCopy}
            </p>

            <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-sm text-foreground transition-colors hover:bg-accent">
              <input
                type="checkbox"
                checked={Boolean(currentUser.totpEnabled)}
                onChange={handleToggleLogin}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-border bg-background text-primary accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="leading-snug">{text.totpToggleLoginLabel}</span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsTesting((current) => !current)
                  setTestError('')
                  setTestSuccess('')
                  setTestCode('')
                }}
                className={GHOST_BTN}
                aria-expanded={isTesting}
              >
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                {isTesting ? text.totpTestHide : text.totpTestShow}
              </button>

              <button type="button" onClick={disable2FA} className={DANGER_BTN}>
                <ShieldOff className="h-4 w-4" aria-hidden="true" />
                {text.totpDisable}
              </button>
            </div>

            {isTesting ? (
              <div className="grid gap-3 rounded-xl border border-border bg-card p-4 lg:p-5">
                <h4 className="text-sm font-semibold tracking-tight text-foreground">
                  {text.totpTestHeading}
                </h4>
                <p className="text-sm text-muted-foreground">{text.totpTestInstruction}</p>

                <Feedback tone="error">{testError}</Feedback>
                <Feedback tone="success">{testSuccess}</Feedback>

                <form onSubmit={runTestCode} className="grid gap-3">
                  <label htmlFor="totp-test-code" className="sr-only">
                    {text.codeInputLabel}
                  </label>
                  <input
                    id="totp-test-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength="6"
                    placeholder="000000"
                    value={testCode}
                    onChange={(event) => setTestCode(event.target.value.replace(/\D/g, ''))}
                    required
                    className={CODE_INPUT}
                  />
                  <div>
                    <button type="submit" className={PRIMARY_BTN}>
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      {text.totpTestSubmit}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
          </div>
        ) : null}
      </SectionCard>
    </div>
  )
}
