const usernamePattern = /^[a-z](?:[a-z0-9._-]{0,62}[a-z0-9])?$/
const domainPattern = /^[a-z0-9](?:[a-z0-9-]*\.)+[a-z]{2,}$/

const emailDomain = import.meta.env.VITE_AUTH_EMAIL_DOMAIN?.trim().toLowerCase()

export function isAuthDomainConfigured() {
  return Boolean(emailDomain && domainPattern.test(emailDomain))
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase()
}

export function isValidUsername(value: string) {
  return usernamePattern.test(normalizeUsername(value))
}

export function emailForUsername(value: string) {
  if (!isAuthDomainConfigured() || !isValidUsername(value)) return null
  return `${normalizeUsername(value)}@${emailDomain}`
}

export function isAllowedAuthEmail(value: string | undefined) {
  if (!isAuthDomainConfigured() || !value) return false
  const [localPart, domain, extra] = value.toLowerCase().split("@")
  return !extra && isValidUsername(localPart) && domain === emailDomain
}
