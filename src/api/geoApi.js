import { API_BASE_URL } from './http'

/**
 * Autocomplétion d'adresses complètes via l'API Adresse (BAN — Base Adresse Nationale).
 * Endpoint backend : GET /api/geo/address?q=...
 * PUBLIC — pas de JWT requis.
 *
 * @param {string} query   Texte saisi (min 3 caractères)
 * @param {number} limit   Max résultats (défaut 8)
 * @returns {Promise<Array<{
 *   label: string,
 *   housenumber: string,
 *   street: string,
 *   postcode: string,
 *   city: string,
 *   context: string,
 *   type: string,
 * }>>}
 */
export async function searchAddresses(query, limit = 8) {
  if (!query || query.trim().length < 3) return []

  const params = new URLSearchParams({ q: query.trim(), limit: String(limit) })
  const response = await fetch(`${API_BASE_URL}/api/geo/address?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) return []

  try {
    return await response.json()
  } catch {
    return []
  }
}
