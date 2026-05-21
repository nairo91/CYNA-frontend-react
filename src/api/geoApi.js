import { apiGet } from './http'

/**
 * Wrapper autour du controller Symfony `GeoController` qui proxifie les APIs
 * gouvernementales DINUM (BAN + Géo). Ces endpoints sont publics (pas de JWT).
 */

/**
 * Recherche d'adresses completes via la Base Adresse Nationale (BAN).
 *
 * @param {string}              query        Texte libre (min 3 caracteres)
 * @param {object}              [options]
 * @param {number}              [options.limit=8]
 * @param {string|null}         [options.postcode]
 * @param {'housenumber'|'street'|'municipality'|'locality'|null} [options.type]
 * @param {AbortSignal|null}    [options.signal]
 *
 * @returns {Promise<Array<{
 *   label: string,
 *   housenumber: string,
 *   street: string,
 *   postcode: string,
 *   city: string,
 *   context: string,
 *   type: string,
 *   score: number,
 *   lon: number,
 *   lat: number,
 * }>>}
 */
export async function searchAddresses(query, options = {}) {
  const trimmed = (query ?? '').trim()
  if (trimmed.length < 3) return []

  const params = new URLSearchParams({ q: trimmed })
  if (options.limit) params.set('limit', String(options.limit))
  if (options.postcode) params.set('postcode', options.postcode)
  if (options.type) params.set('type', options.type)

  const response = await apiGet(`/api/geo/address?${params.toString()}`, {
    authenticated: false,
  })

  if (Array.isArray(response)) return response
  if (Array.isArray(response?.['hydra:member'])) return response['hydra:member']
  return []
}

/**
 * Recherche de communes par nom (autocompletion du champ Ville seul).
 *
 * @returns {Promise<Array<{
 *   nom: string,
 *   code: string,
 *   codesPostaux: string[],
 *   departement: { code: string, nom: string },
 *   region: { code: string, nom: string },
 *   population?: number,
 * }>>}
 */
export async function searchCommunes(query, options = {}) {
  const trimmed = (query ?? '').trim()
  if (trimmed.length < 2) return []

  const params = new URLSearchParams({ q: trimmed })
  if (options.limit) params.set('limit', String(options.limit))

  const response = await apiGet(`/api/geo/communes?${params.toString()}`, {
    authenticated: false,
  })

  return Array.isArray(response) ? response : []
}

/**
 * Recherche de communes par code postal.
 *
 * @returns {Promise<Array<{nom, code, codesPostaux, departement, region, population}>>}
 */
export async function searchCommunesByPostalCode(postalCode, options = {}) {
  const cp = (postalCode ?? '').trim()
  if (!/^\d{4,5}$/.test(cp)) return []

  const params = new URLSearchParams({ cp })
  if (options.limit) params.set('limit', String(options.limit))

  const response = await apiGet(`/api/geo/communes/postal?${params.toString()}`, {
    authenticated: false,
  })

  return Array.isArray(response) ? response : []
}

/**
 * Normalise un resultat de l'API BAN en payload d'adresse pret pour le formulaire.
 * Le `context` de la BAN est de la forme : "75, Paris, Île-de-France"
 *                                          (code dept, nom dept, nom region)
 */
export function toAddressFields(banResult) {
  if (!banResult) return null
  const parts = (banResult.context ?? '').split(',').map((s) => s.trim())
  const regionName = parts.length >= 3 ? parts.slice(2).join(', ') : ''

  const street = banResult.housenumber
    ? `${banResult.housenumber} ${banResult.street}`.trim()
    : banResult.street

  return {
    line1: street || banResult.label || '',
    postalCode: banResult.postcode || '',
    city: banResult.city || '',
    region: regionName,
    country: 'France',
    label: banResult.label || '',
  }
}
