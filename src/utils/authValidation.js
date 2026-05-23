const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UPPERCASE_PATTERN = /[A-Z]/
const LOWERCASE_PATTERN = /[a-z]/
const DIGIT_PATTERN = /[0-9]/
const SPECIAL_PATTERN = /[^A-Za-z0-9]/

export const PASSWORD_MIN_LENGTH = 12

export function isValidEmail(email) {
  return EMAIL_PATTERN.test(email)
}

export function isStrongPassword(password) {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    UPPERCASE_PATTERN.test(password) &&
    LOWERCASE_PATTERN.test(password) &&
    DIGIT_PATTERN.test(password) &&
    SPECIAL_PATTERN.test(password)
  )
}

export function getLoginValidationError({ email, password }) {
  if (!email.trim() || !password.trim()) {
    return 'Veuillez remplir tous les champs obligatoires.'
  }
  if (!isValidEmail(email)) {
    return 'Adresse e-mail invalide.'
  }
  return ''
}

export function getRegisterValidationError({ fullName, email, password, confirmPassword }) {
  if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
    return 'Veuillez remplir tous les champs obligatoires.'
  }
  if (!isValidEmail(email)) {
    return 'Adresse e-mail invalide.'
  }
  if (!isStrongPassword(password)) {
    return `Mot de passe trop faible : minimum ${PASSWORD_MIN_LENGTH} caracteres avec majuscule, minuscule, chiffre et caractere special.`
  }
  if (password !== confirmPassword) {
    return 'Les mots de passe ne correspondent pas.'
  }
  return ''
}

export function splitFullName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstname: '', lastname: '' }
  if (parts.length === 1) return { firstname: parts[0], lastname: '' }
  const [firstname, ...rest] = parts
  return { firstname, lastname: rest.join(' ') }
}

function readFirstApiViolation(payload) {
  if (!payload || typeof payload !== 'object') return null
  if (Array.isArray(payload.violations) && payload.violations.length > 0) {
    return payload.violations[0].message || null
  }
  if (typeof payload['hydra:description'] === 'string') {
    return payload['hydra:description']
  }
  if (typeof payload.detail === 'string') {
    return payload.detail
  }
  return null
}

export function mapRegisterApiError(error) {
  const status = error?.status
  const payload = error?.payload

  const violation = readFirstApiViolation(payload)
  if (violation) return violation

  const source = `${error?.message ?? ''} ${JSON.stringify(payload ?? {})}`.toLowerCase()

  if (status === 409 || source.includes('already') || source.includes('existe deja') || source.includes('unique')) {
    return 'Un compte existe deja avec cette adresse e-mail.'
  }
  if (status === 422 || status === 400) {
    return 'Les informations fournies ne sont pas valides. Verifiez vos champs.'
  }
  if (!status) {
    const base = import.meta.env?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'
    return `Impossible de joindre le serveur (verifiez que le back tourne sur ${base}).`
  }
  const detail = error?.message ? ` - ${error.message}` : ''
  return `Erreur ${status}${detail}`
}

export function mapLoginApiError(error) {
  const source = `${error?.message ?? ''} ${JSON.stringify(error?.payload ?? {})}`.toLowerCase()

  if (source.includes('brevo') || source.includes('envoyer le code a2f') || source.includes('ip actuelle')) {
    return error?.message ?? 'Impossible d envoyer le code A2F par e-mail. Verifiez la configuration Brevo.'
  }

  if (
    source.includes('code 2fa') ||
    source.includes('double authentification') ||
    source.includes('invalid code') ||
    source.includes('code invalide') ||
    (error?.status === 400 && source.includes('code'))
  ) {
    return 'Code de securite invalide ou expire. Veuillez reessayer.'
  }

  if (source.includes('not activated') || source.includes('not verified') || source.includes('inactive')) {
    return 'Compte non active. Verifiez votre e-mail pour valider votre inscription.'
  }
  if (
    source.includes('not found') ||
    source.includes('user_not_found') ||
    source.includes('no account') ||
    source.includes('unknown email')
  ) {
    return 'Aucun compte trouve avec cette adresse e-mail.'
  }
  if (source.includes('invalid credentials') || error?.status === 401) {
    return 'Mot de passe incorrect. Veuillez reessayer.'
  }
  if (!error?.status) {
    const base = import.meta.env?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'
    return `Impossible de joindre le serveur (verifiez que le back tourne sur ${base}).`
  }
  return 'Une erreur est survenue. Veuillez reessayer.'
}
