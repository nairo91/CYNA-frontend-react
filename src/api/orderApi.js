import { apiGet, apiPost } from './http'

function toList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.['hydra:member'])) return payload['hydra:member']
  if (Array.isArray(payload?.member)) return payload.member
  return []
}

export async function getMyOrders() {
  const payload = await apiGet('/api/orders?order[createdAt]=desc')
  return toList(payload)
}

export function getOrder(id) {
  return apiGet(`/api/orders/${id}`)
}

export function createOrder(payload) {
  return apiPost('/api/orders', payload)
}
