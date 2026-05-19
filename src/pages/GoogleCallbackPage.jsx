import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * GoogleCallbackPage
 *
 * Symfony redirige ici après le flow OAuth Google avec :
 *   /auth/google/callback?token=<jwt>          → succès
 *   /auth/google/callback?error=<message>      → échec
 *
 * Cette page n'a pas de layout visible : elle traite le token et redirige immédiatement.
 */
export function GoogleCallbackPage() {
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('pending') // 'pending' | 'error'
  const [errorMsg, setErrorMsg] = useState('')
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    const error  = params.get('error')

    if (error) {
      setErrorMsg(decodeURIComponent(error))
      setStatus('error')
      return
    }

    if (!token) {
      setErrorMsg('Aucun token reçu. Veuillez réessayer.')
      setStatus('error')
      return
    }

    loginWithToken(token)
      .then(() => navigate('/espace-client', { replace: true }))
      .catch((err) => {
        setErrorMsg(err?.message ?? 'Erreur d\'authentification Google.')
        setStatus('error')
      })
  }, [loginWithToken, navigate])

  if (status === 'error') {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem' }}>
        <p style={{ fontSize: '1.125rem', color: 'var(--color-danger, #dc2626)', textAlign: 'center' }}>
          {errorMsg}
        </p>
        <a href="/login" style={{ textDecoration: 'underline', color: 'var(--color-primary, #4f46e5)' }}>
          Retour à la connexion
        </a>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--color-muted, #6b7280)', fontSize: '1rem' }}>
        Connexion Google en cours…
      </p>
    </div>
  )
}
