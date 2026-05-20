/* eslint-disable react/prop-types */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import {
  addItemToCart,
  createCart,
  getCart,
  getStoredCartId,
  removeCartItem,
  storeCartId,
  updateCartItem,
} from '../api/cartApi'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const LOCAL_KEY = 'cyna_local_cart'

/**
 * Lecture/écriture d'un panier local pour les invités (sans backend).
 * Format: { items: [{ productId, name, price, image, quantity, durationMonths }] }
 */
function loadLocalCart() {
  if (typeof window === 'undefined') return { items: [] }
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : { items: [] }
  } catch {
    return { items: [] }
  }
}

function saveLocalCart(cart) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(cart))
}

function clearLocalCart() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(LOCAL_KEY)
}

function reducer(state, action) {
  switch (action.type) {
    case 'set':
      return { ...state, ...action.payload }
    case 'patch':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const { isAuthenticated, isInitializing } = useAuth()
  const [state, dispatch] = useReducer(reducer, {
    cartId: null,
    items: [], // [{ id?, productId, name, price, image, quantity, durationMonths }]
    isLoading: true,
    error: null,
  })

  /* ------------------------------------------------------------------ */
  /* Hydratation au montage / changement d'auth                         */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (isInitializing) return
    let cancelled = false

    async function hydrate() {
      dispatch({ type: 'patch', payload: { isLoading: true, error: null } })

      if (!isAuthenticated) {
        // Mode invité : on lit le localStorage uniquement.
        const local = loadLocalCart()
        if (cancelled) return
        dispatch({
          type: 'set',
          payload: { cartId: null, items: local.items ?? [], isLoading: false },
        })
        return
      }

      // Mode connecté : on essaie d'utiliser le panier API existant, sinon on en crée un.
      try {
        let cartId = getStoredCartId()
        let cart = null
        if (cartId) {
          try {
            cart = await getCart(cartId)
          } catch {
            cart = null
            storeCartId(null)
            cartId = null
          }
        }
        if (!cart) {
          cart = await createCart()
          storeCartId(cart.id)
          cartId = cart.id

          // Si on avait un panier local en invité, on le pousse sur le serveur.
          const local = loadLocalCart()
          for (const it of local.items ?? []) {
            try {
              await addItemToCart({
                cartId,
                productId: it.productId,
                quantity: it.quantity,
                durationMonths: it.durationMonths ?? 1,
              })
            } catch {
              // on continue, peu importe si une ligne échoue
            }
          }
          if ((local.items ?? []).length > 0) {
            cart = await getCart(cartId)
            clearLocalCart()
          }
        }

        if (cancelled) return
        dispatch({
          type: 'set',
          payload: {
            cartId,
            items: mapApiCartToItems(cart),
            isLoading: false,
          },
        })
      } catch (err) {
        if (cancelled) return
        dispatch({
          type: 'set',
          payload: { isLoading: false, error: err?.message ?? 'cart hydration failed' },
        })
      }
    }

    hydrate()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, isInitializing])

  function mapApiCartToItems(cart) {
    if (!cart?.items) return []
    return cart.items.map((it) => ({
      id: it.id,
      productId: it.saasService?.id ?? it.saasService,
      name: it.saasService?.name ?? it.productNameSnapshot ?? `Produit #${it.id}`,
      price: it.saasService?.price ?? it.unitPriceSnapshot ?? null,
      image: it.saasService?.image ?? null,
      quantity: it.quantity ?? 1,
      durationMonths: it.durationMonths ?? 1,
      available: it.saasService?.available !== false,
    }))
  }

  /* ------------------------------------------------------------------ */
  /* Actions                                                            */
  /* ------------------------------------------------------------------ */

  const addItem = useCallback(
    async (product, { quantity = 1, durationMonths = 1 } = {}) => {
      const productId = product.id
      if (!productId) return

      // Mode invité -> localStorage
      if (!isAuthenticated) {
        const items = [...state.items]
        const existing = items.find((it) => it.productId === productId)
        if (existing) existing.quantity += quantity
        else
          items.push({
            productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
            durationMonths,
          })
        saveLocalCart({ items })
        dispatch({ type: 'patch', payload: { items } })
        return
      }

      // Mode connecté -> API
      const existing = state.items.find((it) => it.productId === productId)
      if (existing) {
        await updateCartItem(existing.id, { quantity: existing.quantity + quantity })
      } else {
        await addItemToCart({
          cartId: state.cartId,
          productId,
          quantity,
          durationMonths,
        })
      }
      const fresh = await getCart(state.cartId)
      dispatch({ type: 'patch', payload: { items: mapApiCartToItems(fresh) } })
    },
    [isAuthenticated, state.cartId, state.items],
  )

  const updateQuantity = useCallback(
    async (itemKey, quantity) => {
      const safeQuantity = Math.max(1, Number(quantity) || 1)

      if (!isAuthenticated) {
        const items = state.items.map((it) =>
          it.productId === itemKey ? { ...it, quantity: safeQuantity } : it,
        )
        saveLocalCart({ items })
        dispatch({ type: 'patch', payload: { items } })
        return
      }

      await updateCartItem(itemKey, { quantity: safeQuantity })
      const fresh = await getCart(state.cartId)
      dispatch({ type: 'patch', payload: { items: mapApiCartToItems(fresh) } })
    },
    [isAuthenticated, state.cartId, state.items],
  )

  const updateDuration = useCallback(
    async (itemKey, durationMonths) => {
      const safeDuration = Math.max(1, Number(durationMonths) || 1)

      if (!isAuthenticated) {
        const items = state.items.map((it) =>
          it.productId === itemKey ? { ...it, durationMonths: safeDuration } : it,
        )
        saveLocalCart({ items })
        dispatch({ type: 'patch', payload: { items } })
        return
      }

      await updateCartItem(itemKey, { durationMonths: safeDuration })
      const fresh = await getCart(state.cartId)
      dispatch({ type: 'patch', payload: { items: mapApiCartToItems(fresh) } })
    },
    [isAuthenticated, state.cartId, state.items],
  )

  const removeItem = useCallback(
    async (itemKey) => {
      if (!isAuthenticated) {
        const items = state.items.filter((it) => it.productId !== itemKey)
        saveLocalCart({ items })
        dispatch({ type: 'patch', payload: { items } })
        return
      }
      await removeCartItem(itemKey)
      const fresh = await getCart(state.cartId)
      dispatch({ type: 'patch', payload: { items: mapApiCartToItems(fresh) } })
    },
    [isAuthenticated, state.cartId, state.items],
  )

  const clearCart = useCallback(() => {
    if (!isAuthenticated) {
      clearLocalCart()
      dispatch({ type: 'patch', payload: { items: [] } })
    } else {
      storeCartId(null)
      dispatch({ type: 'patch', payload: { cartId: null, items: [] } })
    }
  }, [isAuthenticated])

  /* ------------------------------------------------------------------ */
  /* Sélecteurs dérivés                                                 */
  /* ------------------------------------------------------------------ */

  const itemCount = useMemo(
    () => state.items.reduce((sum, it) => sum + (it.quantity ?? 0), 0),
    [state.items],
  )

  const subtotal = useMemo(
    () =>
      state.items.reduce((sum, it) => {
        const price = Number(it.price)
        if (Number.isFinite(price)) return sum + price * (it.quantity ?? 0) * (it.durationMonths ?? 1)
        return sum
      }, 0),
    [state.items],
  )

  const value = useMemo(
    () => ({
      cartId: state.cartId,
      items: state.items,
      itemCount,
      subtotal,
      isLoading: state.isLoading,
      error: state.error,
      addItem,
      updateQuantity,
      updateDuration,
      removeItem,
      clearCart,
    }),
    [state, itemCount, subtotal, addItem, updateQuantity, updateDuration, removeItem, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart doit être utilisé dans un CartProvider.')
  return ctx
}
