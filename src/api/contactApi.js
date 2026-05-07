import { apiPost } from './http'

export function sendContactMessage(payload) {
  return apiPost(
    '/api/contact_messages',
    {
      fullName: payload.fullName ?? payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
    },
    { authenticated: false },
  )
}
