import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  clearAuthToken,
  fetchCurrentUser,
  getAuthToken,
  loginWithPassword,
  logout as logoutClient,
  registerUser,
  saveAuthToken,
} from '../api/authApi'
import { onUnauthorized } from '../api/http'

const AuthContext = createContext(null)

/**
 * AuthProvider — source de vérité pour l'état d'authentification.
 *
 *  - Au montage : si un JWT existe en storage, on hydrate `user` via GET /api/me.
 *  - Expose login/register/logout et le user courant.
 *  - S'abonne aux 401 du client HTTP pour se déconnecter proprement.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const mountedRef = useRef(true)

  const hydrateUser = useCallback(async () => {
    if (!getAuthToken()) {
      setUser(null)
      return null
    }
    try {
      const me = await fetchCurrentUser()
      if (mountedRef.current) setUser(me)
      return me
    } catch {
      // Token expiré / invalide → on nettoie
      clearAuthToken()
      if (mountedRef.current) setUser(null)
      return null
    }
  }, [])

  // Hydratation initiale.
  useEffect(() => {
    mountedRef.current = true
    hydrateUser().finally(() => {
      if (mountedRef.current) setIsInitializing(false)
    })
    return () => {
      mountedRef.current = false
    }
  }, [hydrateUser])

  // Déconnexion auto sur 401.
  useEffect(() => {
    return onUnauthorized(() => {
      clearAuthToken()
      setUser(null)
    })
  }, [])

  const login = useCallback(async ({ email, password, rememberMe = true }) => {
    setIsAuthenticating(true)
    try {
      const response = await loginWithPassword({ email, password })
      if (!response?.token) {
        throw new Error('Réponse de login invalide.')
      }
      saveAuthToken(response.token, rememberMe)
      const me = await hydrateUser()
      return me
    } finally {
      setIsAuthenticating(false)
    }
  }, [hydrateUser])

  const register = useCallback(async (payload) => {
    setIsAuthenticating(true)
    try {
      return await registerUser(payload)
    } finally {
      setIsAuthenticating(false)
    }
  }, [])

  const logout = useCallback(() => {
    logoutClient()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      isAuthenticating,
      login,
      register,
      logout,
      refresh: hydrateUser,
    }),
    [user, isInitializing, isAuthenticating, login, register, logout, hydrateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>.')
  }
  return ctx
}
