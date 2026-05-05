import { apiDelete, apiGet, apiPatch, apiPost } from './http'

function toList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.['hydra:member'])) return payload['hydra:member']
  if (Array.isArray(payload?.member)) return payload.member
  return []
}

export async function getMyAddresses() {
  const payload = await apiGet('/api/addresses')
  return toList(payload)
}

export function createAddress(payload) {
  return apiPost('/api/addresses', payload)
}

export function updateAddress(id, payload) {
  return apiPatch(`/api/addresses/${id}`, payload)
}

export function deleteAddress(id) {
  return apiDelete(`/api/addresses/${id}`)
}
