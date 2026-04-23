import type { CookieEntry } from './VirtualCookieStore.types.js'
import { capitalize } from './utils.js'

/**
 * Parses a raw `Cookie` request header into name/value pairs.
 * @returns Parsed cookie name/value pairs.
 */
export function parseCookie(cookieHeader: string) {
  if (!cookieHeader.trim()) {
    return []
  }

  const cookies = []
  const parts = cookieHeader.split(';')

  for (let i = 0, len = parts.length; i < len; i++) {
    const part = parts[i].trim()

    if (!part) {
      continue
    }

    const index = part.indexOf('=')

    cookies.push(index === -1
      ? {
        name: part,
        value: ''
      }
      : {
        name: part.slice(0, index).trim(),
        value: part.slice(index + 1).trim()
      })
  }

  return cookies
}

/**
 * Serializes a cookie entry into a `Set-Cookie` header value.
 * @returns A `Set-Cookie` header value.
 */
export function serializeSetCookie(entry: CookieEntry) {
  const parts = [`${entry.name}=${entry.value}`]

  if (entry.domain) {
    parts.push(`Domain=${entry.domain}`)
  }

  if (entry.path) {
    parts.push(`Path=${entry.path}`)
  }

  if (entry.expires !== null) {
    parts.push(`Expires=${new Date(entry.expires).toUTCString()}`)
  }

  if (entry.maxAge !== null) {
    parts.push(`Max-Age=${entry.maxAge}`)
  }

  if (entry.sameSite) {
    parts.push(`SameSite=${capitalize(entry.sameSite)}`)
  }

  if (entry.secure) {
    parts.push('Secure')
  }

  if (entry.partitioned) {
    parts.push('Partitioned')
  }

  return parts.join('; ')
}

/**
 * Serializes a cookie deletion into an expired `Set-Cookie` header value.
 * @returns An expired `Set-Cookie` header value.
 */
export function serializeDeleteCookie(entry: CookieEntry) {
  const parts = [`${entry.name}=`]

  if (entry.domain) {
    parts.push(`Domain=${entry.domain}`)
  }

  if (entry.path) {
    parts.push(`Path=${entry.path}`)
  }

  parts.push('Expires=Thu, 01 Jan 1970 00:00:00 GMT')
  parts.push('Max-Age=0')

  if (entry.partitioned) {
    parts.push('Partitioned')
  }

  return parts.join('; ')
}
