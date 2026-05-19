import { apiPost } from './http'

export function sendTestMail(recipient) {
  return apiPost('/api/mail/test', { recipient })
}
