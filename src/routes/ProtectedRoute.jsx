import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Route protégée — redirige vers /login si l'utilisateur n'est pas authentifié.
 * Accepte un prop `roles` optionnel pour restreindre à certains rôles.
 */
export function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, isInitializing, user } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    // On évite un flash "non connecté" pendant l'hydratation initiale.
    return <div className="app-loading">Chargement…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && roles.length > 0) {
    const userRoles = user?.roles ?? []
    const allowed = roles.some((role) => userRoles.includes(role))
    if (!allowed) {
      return <Navigate to="/" replace />
    }
  }

  return children
}
