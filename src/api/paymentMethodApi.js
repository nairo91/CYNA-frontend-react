import { apiDelete, apiGet, apiPost } from './http'

function toList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.['hydra:member'])) return payload['hydra:member']
  if (Array.isArray(payload?.member)) return payload.member
  return []
}

export async function getMyPaymentMethods() {
  const payload = await apiGet('/api/payment_methods')
  return toList(payload)
}

export function createPaymentMethod(payload) {
  return apiPost('/api/payment_methods', payload)
}

export function deletePaymentMethod(id) {
  const numericId = typeof id === 'string' && id.includes('/') ? id.split('/').pop() : id
  return apiDelete(`/api/payment_methods/${numericId}`)
}
