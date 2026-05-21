/**
 * Service Worker minimaliste pour CYNA-frontend-react.
 *
 * Strategie :
 *  - Shell (index.html + favicon + manifest) precache au install.
 *  - Assets statiques (JS/CSS/fonts/images) : stale-while-revalidate.
 *  - Pages HTML : network-first avec fallback offline.
 *  - Calls API (`/api/...`) : aucune mise en cache (donnees toujours fraiches).
 *
 * Pas de Workbox pour eviter d'embarquer une dependance ; tout est en API
 * native (Cache, Fetch, Workers). Compatibilite : Chrome, Firefox, Safari 16+.
 */

const CACHE_VERSION = 'cyna-v1'
const SHELL_CACHE = `${CACHE_VERSION}-shell`
const ASSET_CACHE = `${CACHE_VERSION}-assets`
const PAGE_CACHE = `${CACHE_VERSION}-pages`

const SHELL_URLS = ['/', '/favicon.png', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

function isApiRequest(url) {
  return url.pathname.startsWith('/api/')
}

function isAssetRequest(request) {
  const dest = request.destination
  return (
    dest === 'script' ||
    dest === 'style' ||
    dest === 'font' ||
    dest === 'image' ||
    request.url.includes('/assets/')
  )
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE)
  const cached = await cache.match(request)
  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => cached)
  return cached || networkFetch
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (err) {
    const cached = await cache.match(request)
    if (cached) return cached
    const shell = await caches.match('/')
    if (shell) return shell
    return new Response(
      '<h1>Hors ligne</h1><p>Cette page n\'est pas disponible hors ligne.</p>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 },
    )
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  if (url.origin !== self.location.origin) return
  if (isApiRequest(url)) return

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirstPage(event.request))
    return
  }

  if (isAssetRequest(event.request)) {
    event.respondWith(staleWhileRevalidate(event.request))
  }
})
