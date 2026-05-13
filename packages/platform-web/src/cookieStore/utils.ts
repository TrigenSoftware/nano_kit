const millisecondsInSecond = 1000

export function normalizePath(path?: string | null) {
  if (!path) {
    return '/'
  }

  return path.startsWith('/')
    ? path
    : `/${path}`
}

export function normalizeDomain(domain?: string | null) {
  return domain
    ? domain.replace(/^\.+/, '')
    : null
}

export function normalizeMaxAge(maxAge?: number | null) {
  if (maxAge === undefined || maxAge === null) {
    return null
  }

  return Math.trunc(maxAge)
}

export function normalizeExpires(
  expires?: number | null,
  maxAge?: number | null
) {
  if (typeof expires === 'number') {
    return expires
  }

  if (typeof maxAge === 'number') {
    return Date.now() + maxAge * millisecondsInSecond
  }

  return null
}

export function isExpired(
  expires: number | null,
  maxAge: number | null
) {
  return maxAge !== null && maxAge <= 0
    || expires !== null && expires <= Date.now()
}

export function capitalize(value: CookieSameSite) {
  return value[0].toUpperCase() + value.slice(1)
}
