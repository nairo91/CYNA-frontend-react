import { apiDelete, apiGet, apiPatch, apiPost } from './http'

const TOKEN_KEY = 'cyna_cart_id'

export function getStoredCartId() {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(TOKEN_KEY)
  return raw ? Number(raw) : null
}

export function storeCartId(id) {
  if (typeof window === 'undefined') return
  if (id) window.localStorage.setItem(TOKEN_KEY, String(id))
  else window.localStorage.removeItem(TOKEN_KEY)
}

export function createCart() {
  return apiPost('/api/carts', {}, { authenticated: true })
}

export function getCart(id) {
  return apiGet(`/api/carts/${id}`)
}

export function addItemToCart({ cartId, productId, quantity = 1, durationMonths = 1 }) {
  return apiPost('/api/cart_items', {
    cart: `/api/carts/${cartId}`,
    saasService: `/api/saas_services/${productId}`,
    quantity,
    durationMonths,
  })
}

export function updateCartItem(itemId, payload) {
  return apiPatch(`/api/cart_items/${itemId}`, payload)
}

export function removeCartItem(itemId) {
  return apiDelete(`/api/cart_items/${itemId}`)
}
