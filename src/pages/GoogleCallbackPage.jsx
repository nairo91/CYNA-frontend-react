import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, KeyRound, Loader2, MailCheck, ShieldCheck } from 'lucide-react'
import { apiPost } from '../api/http'
import { useAuth } from '../context/AuthContext'

export function GoogleCallbackPage() {
  const { loginWithToken, verify2fa } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('pending')
  const [errorMsg, setErrorMsg] = useState('')
  const [challenge, setChallenge] = useState(null)
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const handled = useRef(false)

  const params = useMemo(() => new URLSearchParams(window.location.search), [])

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const oauthCode = params.get('code')
    const token = params.get('token')
    const error = params.get('error')
    const requires2fa = params.get('requires2fa') === '1'

    if (error) {
      setErrorMsg(decodeURIComponent(error))
      setStatus('error')
      return
    }

    if (requires2fa) {
      setChallenge({
        email: params.get('email') ?? '',
        method: params.get('method') ?? 'email',
        provider: params.get('provider') ?? 'google',
        challenge: params.get('challenge') ?? '',
      })
      setStatus('2fa')
      return
    }

    if (!oauthCode && !token) {
      setErrorMsg('Aucun code Google recu. Veuillez reessayer.')
      setStatus('error')
      return
    }

    const authenticate = token
      ? Promise.resolve({ token })
      : apiPost('/api/auth/google/callback', { code: oauthCode }, { authenticated: false })

    authenticate
      .then((payload) => {
        if (payload?.requires2fa) {
          setChallenge({
            email: payload.email ?? '',
            method: payload.method ?? 'email',
            provider: payload.provider ?? 'google',
            challenge: payload.challenge ?? '',
          })
          setStatus('2fa')
          return null
        }

        return loginWithToken(payload.token).then(() => navigate('/espace-client', { replace: true }))
      })
      .catch((err) => {
        setErrorMsg(
          err?.message ??
          'Le service d authentification Google est momentanement indisponible, veuillez reessayer.'
        )
        setStatus('error')
      })
  }, [loginWithToken, navigate, params])

  const handleTwoFactorSubmit = async (event) => {
    event.preventDefault()
    if (!challenge) return

    setErrorMsg('')
    setIsSubmitting(true)

    try {
      await verify2fa({
        email: challenge.email,
        code,
        provider: challenge.provider,
        challenge: challenge.challenge,
        rememberMe: true,
      })
      navigate('/espace-client', { replace: true })
    } catch (err) {
      setErrorMsg(err?.message ?? 'Code A2F invalide ou expire.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'error') {
    return (
      <main className="google-auth-shell">
        <section className="google-auth-card google-auth-card-error" role="alert">
          <span className="google-auth-icon google-auth-icon-error">
            <AlertCircle aria-hidden="true" />
          </span>
          <h1>Connexion Google interrompue</h1>
          <p>{errorMsg}</p>
          <Link to="/login" className="google-auth-secondary-action">
            Retour a la connexion
          </Link>
        </section>
      </main>
    )
  }

  if (status === '2fa' && challenge) {
    const isEmailChallenge = challenge.method === 'email'
    const Icon = isEmailChallenge ? MailCheck : ShieldCheck

    return (
      <main className="google-auth-shell">
        <form className="google-auth-card" onSubmit={handleTwoFactorSubmit}>
          <div className="google-auth-card-header">
            <span className="google-auth-icon">
              <Icon aria-hidden="true" />
            </span>
            <div>
              <p className="google-auth-kicker">Connexion protegee</p>
              <h1>Verification A2F</h1>
            </div>
          </div>

          <p className="google-auth-copy">
            {isEmailChallenge
              ? `Un code a 6 chiffres vient d etre envoye a ${challenge.email}.`
              : 'Saisissez le code affiche dans Google Authenticator.'}
          </p>

          {errorMsg ? (
            <div className="google-auth-feedback" role="alert">
              <AlertCircle aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          <label className="google-auth-field" htmlFor="google-2fa-code">
            <span>Code de securite</span>
            <input
              id="google-2fa-code"
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength="6"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
            />
          </label>

          <button className="google-auth-primary-action" type="submit" disabled={isSubmitting || code.length !== 6}>
            {isSubmitting ? <Loader2 className="motion-safe:animate-spin" aria-hidden="true" /> : <KeyRound aria-hidden="true" />}
            {isSubmitting ? 'Verification...' : 'Valider et acceder au compte'}
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="google-auth-shell">
      <section className="google-auth-card google-auth-card-loading" role="status">
        <span className="google-auth-icon">
          <Loader2 className="motion-safe:animate-spin" aria-hidden="true" />
        </span>
        <h1>Connexion Google</h1>
        <p>Verification de votre session en cours...</p>
      </section>
    </main>
  )
}
