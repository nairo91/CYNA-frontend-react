import { apiGet, apiPatch, apiPost, setAuthTokenProvider } from './http'

export const AUTH_TOKEN_STORAGE_KEY = 'cyna_auth_token'

/* -------------------------------------------------------------------------- */
/* Stockage du token                                                          */
/* -------------------------------------------------------------------------- */

export function saveAuthToken(token, rememberMe = true) {
  if (typeof window === 'undefined') return
  clearAuthToken()
  const storage = rememberMe ? window.localStorage : window.sessionStorage
  storage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null
  return (
    window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ??
    window.sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  )
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  window.sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

// Enregistre getAuthToken comme fournisseur pour le client HTTP
// (évite la dépendance circulaire authApi <-> http).
setAuthTokenProvider(getAuthToken)

/* -------------------------------------------------------------------------- */
/* Endpoints                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * POST /api/login_check (géré par LexikJWT). Retourne { token }.
 */
export function loginWithPassword(credentials) {
  return apiPost('/api/login_check', credentials, { authenticated: false })
}

/**
 * POST /api/users — déclenche le UserRegistrationProcessor côté Symfony.
 *
 * @param {{ email: string, firstname: string, lastname: string, plainPassword: string }} payload
 */
export function registerUser(payload) {
  return apiPost('/api/users', payload, { authenticated: false })
}

/**
 * GET /api/me — profil de l'utilisateur courant (nécessite un JWT valide).
 */
export function fetchCurrentUser() {
  return apiGet('/api/me')
}

/**
 * PATCH /api/me — mise à jour du profil utilisateur courant.
 * @param {{ firstname?: string, lastname?: string, email?: string }} payload
 */
export function updateMyProfile(payload) {
  return apiPatch('/api/me', payload)
}

/** POST /api/verify-email */
export function verifyEmail({ email, token }) {
  return apiPost('/api/verify-email', { email, token }, { authenticated: false })
}

/** POST /api/verify-email/resend — backend endpoint to be implemented (Sprint 3 ticket). */
export function resendVerificationEmail({ email }) {
  return apiPost('/api/verify-email/resend', { email }, { authenticated: false })
}

/** POST /api/password/forgot */
export function requestPasswordReset(email) {
  return apiPost('/api/password/forgot', { email }, { authenticated: false })
}

/** POST /api/password/reset */
export function resetPassword({ token, password }) {
  return apiPost('/api/password/reset', { token, password }, { authenticated: false })
}

export function loginVerify2fa(payload) {
  return apiPost('/api/login/2fa-verify', payload, { authenticated: false })
}

/** Déconnexion côté client (stateless JWT : rien à appeler côté API). */
export function logout() {
  clearAuthToken()
}
