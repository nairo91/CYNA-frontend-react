import { apiPost } from './http'

export function sendChatbotMessage(payload) {
  return apiPost('/api/chatbot/message', payload, { authenticated: false })
}
