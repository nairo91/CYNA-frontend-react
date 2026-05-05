import { apiPost } from './http'

export function sendContactMessage(payload) {
  return apiPost('/api/contact_messages', payload, { authenticated: false })
}
