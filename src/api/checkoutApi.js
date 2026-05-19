import { apiPost } from './http'

export function createCheckoutPaymentIntent(payload) {
  return apiPost('/api/checkout/payment-intent', payload)
}
