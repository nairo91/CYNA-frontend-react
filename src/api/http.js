const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_API_BASE_URL

const unauthorizedListeners = new Set()

export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener)
  return () => unauthorizedListeners.delete(listener)
}

let authTokenProvider = () => null

export function setAuthTokenProvider(getter) {
  authTokenProvider = typeof getter === 'function' ? getter : () => null
}

async function parseResponse(response) {
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json') || contentType.includes('application/ld+json')) {
    return response.json().catch(() => null)
  }
  return response.text().catch(() => '')
}

function extractErrorMessage(payload, status) {
  if (!payload) return `API request failed with status ${status}`
  return (
    payload.message ??
    payload['hydra:description'] ??
    payload.detail ??
    payload.error ??
    payload.title ??
    `API request failed with status ${status}`
  )
}

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    authenticated = true,
    contentType = 'application/json',
  } = options

  const token = authenticated ? authTokenProvider() : null

  const finalHeaders = {
    Accept: 'application/ld+json, application/json;q=0.9',
    ...(body !== undefined ? { 'Content-Type': contentType } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    ...(body !== undefined
      ? { body: contentType === 'application/json' ? JSON.stringify(body) : body }
      : {}),
  })

  const payload = await parseResponse(response)

  if (response.status === 401) {
    unauthorizedListeners.forEach((listener) => {
      try { listener() } catch (e) { console.error('[http] unauthorized listener failed', e) }
    })
  }

  if (!response.ok) {
    const error = new Error(extractErrorMessage(payload, response.status))
    error.status = response.status
    error.payload = payload
    if (import.meta.env?.DEV) {
      console.error(`[http] ${method} ${path} -> ${response.status}`, payload)
    }
    throw error
  }

  return payload
}

export function apiGet(path, options = {}) {
  return apiRequest(path, { ...options, method: 'GET' })
}

export function apiPost(path, body, options = {}) {
  return apiRequest(path, { ...options, method: 'POST', body })
}

export function apiPatch(path, body, options = {}) {
  return apiRequest(path, {
    ...options,
    method: 'PATCH',
    body,
    contentType: options.contentType ?? 'application/merge-patch+json',
  })
}

export function apiPut(path, body, options = {}) {
  return apiRequest(path, { ...options, method: 'PUT', body })
}

export function apiDelete(path, options = {}) {
  return apiRequest(path, { ...options, method: 'DELETE' })
}
