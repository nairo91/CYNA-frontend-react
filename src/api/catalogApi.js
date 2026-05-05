import { apiGet } from './http'

/**
 * Transforme un payload API Platform (hydra:member / JSON-LD) en tableau plat.
 * Laisse intact un tableau déjà plat renvoyé par un endpoint custom.
 */
function toList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.['hydra:member'])) return payload['hydra:member']
  if (Array.isArray(payload?.member)) return payload.member
  return []
}

/* -------------------------------------------------------------------------- */
/* Home                                                                       */
/* -------------------------------------------------------------------------- */

/** GET /api/home : endpoint agrégé (carousel + catégories + top produits + textes). */
export function getHomeBundle() {
  return apiGet('/api/home', { authenticated: false })
}

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

export async function getCategories() {
  const payload = await apiGet('/api/categories?order[displayOrder]=asc', { authenticated: false })
  return toList(payload)
}

/* -------------------------------------------------------------------------- */
/* Saas services (produits)                                                   */
/* -------------------------------------------------------------------------- */

export async function getFeaturedProducts(limit = 4) {
  // On s'appuie sur l'endpoint agrégé pour les "top produits" (tri par priorité côté back).
  const home = await getHomeBundle()
  return (home?.topProducts ?? []).slice(0, limit)
}

export async function getServices(params = {}) {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.itemsPerPage) query.set('itemsPerPage', String(params.itemsPerPage))
  if (params.name) query.set('name', params.name)
  if (params.categoryId) query.set('category', String(params.categoryId))
  const qs = query.toString()
  const payload = await apiGet(`/api/saas_services${qs ? `?${qs}` : ''}`, { authenticated: false })
  return toList(payload)
}

export function getService(id) {
  return apiGet(`/api/saas_services/${id}`, { authenticated: false })
}

/**
 * GET /api/catalog/search — recherche à facettes (cf. CatalogController).
 *
 * @param {{
 *   q?: string,
 *   category?: number | string,
 *   minPrice?: number | string,
 *   maxPrice?: number | string,
 *   availableOnly?: boolean,
 *   sort?: 'price' | 'name' | 'priority',
 *   direction?: 'asc' | 'desc',
 *   limit?: number,
 *   offset?: number,
 * }} criteria
 */
export function searchCatalog(criteria = {}) {
  const query = new URLSearchParams()
  Object.entries(criteria).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, String(value))
  })
  const qs = query.toString()
  return apiGet(`/api/catalog/search${qs ? `?${qs}` : ''}`, { authenticated: false })
}
