import { API_BASE_URL } from '../api/http'

function buildPlaceholder(label) {
  const safeLabel = String(label)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" role="img" aria-label="${safeLabel}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0e2a52" />
          <stop offset="100%" stop-color="#1695ff" />
        </linearGradient>
      </defs>
      <rect width="640" height="420" rx="28" fill="url(#bg)" />
      <circle cx="520" cy="80" r="88" fill="rgba(255,255,255,0.12)" />
      <circle cx="128" cy="320" r="140" fill="rgba(255,255,255,0.08)" />
      <text x="44" y="320" fill="#f5fbff" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="700">${safeLabel}</text>
    </svg>`,
  )}`
}

export function resolveMediaUrl(source, fallbackLabel) {
  if (!source) {
    return buildPlaceholder(fallbackLabel)
  }

  if (/^https?:\/\//i.test(source) || source.startsWith('data:')) {
    return source
  }

  return `${API_BASE_URL}/${source.replace(/^\/+/, '')}`
}
