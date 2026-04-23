import type {
  CookieEntry,
  VirtualCookieInit,
  VirtualCookieListItem
} from './VirtualCookieStore.types.js'
import {
  parseCookie,
  serializeDeleteCookie,
  serializeSetCookie
} from './raw.js'
import {
  isExpired,
  normalizeDomain,
  normalizeExpires,
  normalizeMaxAge,
  normalizePath
} from './utils.js'

export type {
  VirtualCookieInit,
  VirtualCookieListItem
}

export class VirtualCookieStore implements CookieStore {
  readonly #entries: CookieEntry[] = []
  readonly #requestUrl?: URL
  readonly #setCookieHeaders = new Map<string, string>()
  onchange: ((event: unknown) => unknown) | null = null

  /**
   * Creates a request-bound virtual cookie store.
   * @param cookieHeader - Raw `Cookie` header value from the incoming request.
   * @param requestUrl - Request URL used to validate `get({ url })` and `getAll({ url })`.
   */
  constructor(
    cookieHeader = '',
    requestUrl?: string | URL
  ) {
    if (requestUrl) {
      this.#requestUrl = new URL(requestUrl)
    }

    this.#entries = parseCookie(cookieHeader).map(({ name, value }) => ({
      knownScope: false,
      name,
      value,
      domain: null,
      expires: null,
      maxAge: null,
      partitioned: false,
      path: null,
      secure: false
    }))
  }

  /**
   * No-op server compatibility method.
   */
  addEventListener() { /* no-op */ }

  /**
   * No-op server compatibility method.
   */
  removeEventListener() { /* no-op */ }

  /**
   * No-op server compatibility method.
   * @returns Always `false`.
   */
  dispatchEvent() {
    return false
  }

  /**
   * Returns the first cookie matching the provided name.
   * @param name - Cookie name.
   * @returns The first matching cookie, or `null` if none was found.
   */
  get(name: string): Promise<VirtualCookieListItem | null>
  /**
   * Returns the first cookie matching the provided lookup options.
   * @param options - Cookie lookup options.
   * @returns The first matching cookie, or `null` if none was found.
   */
  get(options?: CookieStoreGetOptions): Promise<VirtualCookieListItem | null>

  async get(
    nameOrOptions: string | CookieStoreGetOptions = {}
  ): Promise<VirtualCookieListItem | null> {
    return this.#find(nameOrOptions, true)
  }

  /**
   * Returns the first cookie matching the provided name synchronously.
   * @param name - Cookie name.
   * @returns The first matching cookie, or `null` if none was found.
   */
  peek(name: string): VirtualCookieListItem | null
  /**
   * Returns the first cookie matching the provided lookup options synchronously.
   * @param options - Cookie lookup options.
   * @returns The first matching cookie, or `null` if none was found.
   */
  peek(options?: CookieStoreGetOptions): VirtualCookieListItem | null

  peek(
    nameOrOptions: string | CookieStoreGetOptions = {}
  ): VirtualCookieListItem | null {
    return this.#find(nameOrOptions, true)
  }

  /**
   * Returns all cookies matching the provided name.
   * @param name - Cookie name.
   * @returns Matching cookies in their current in-store order.
   */
  getAll(name: string): Promise<VirtualCookieListItem[]>
  /**
   * Returns all cookies matching the provided lookup options.
   * @param options - Cookie lookup options.
   * @returns Matching cookies in their current in-store order.
   */
  getAll(options?: CookieStoreGetOptions): Promise<VirtualCookieListItem[]>

  async getAll(
    nameOrOptions: string | CookieStoreGetOptions = {}
  ): Promise<VirtualCookieListItem[]> {
    return this.#find(nameOrOptions, false)
  }

  #find(
    nameOrOptions: string | CookieStoreGetOptions,
    first: true
  ): VirtualCookieListItem | null

  #find(
    nameOrOptions?: string | CookieStoreGetOptions,
    first?: false
  ): VirtualCookieListItem[]

  #find(
    nameOrOptions: string | CookieStoreGetOptions = {},
    first = false
  ) {
    const options = typeof nameOrOptions === 'string'
      ? {
        name: nameOrOptions
      }
      : nameOrOptions

    this.#assertUrl(options.url)

    const cookies: VirtualCookieListItem[] = []

    for (let i = 0, len = this.#entries.length; i < len; i++) {
      const entry = this.#entries[i]

      if (!options.name || entry.name === options.name) {
        const cookie = toCookieListItem(entry)

        if (first) {
          return cookie
        }

        cookies.push(cookie)
      }
    }

    return first
      ? null
      : cookies
  }

  /**
   * Sets or replaces a cookie by name and value.
   * @param name - Cookie name.
   * @param value - Cookie value.
   */
  set(name: string, value: string): Promise<void>
  /**
   * Sets or replaces a cookie using full initialization options.
   * @param options - Cookie initialization options.
   */
  set(options: VirtualCookieInit): Promise<void>

  async set(
    nameOrOptions: string | VirtualCookieInit,
    maybeValue?: string
  ): Promise<void> {
    const entry = entryFromCookieInit(nameOrOptions, maybeValue)
    const key = cookieIdentity(entry)
    const expired = isExpired(entry.expires, entry.maxAge)

    this.#removeMatchingEntries(entry)

    if (!expired) {
      this.#entries.push(entry)
    }

    this.#setCookieHeaders.set(
      key,
      expired
        ? serializeDeleteCookie(entry)
        : serializeSetCookie(entry)
    )
  }

  /**
   * Deletes a cookie by name and records an expired `Set-Cookie` header value.
   * @param name - Cookie name.
   */
  delete(name: string): Promise<void>
  /**
   * Deletes a cookie using deletion options and records an expired `Set-Cookie` header value.
   * @param options - Cookie deletion options.
   */
  delete(options: CookieStoreDeleteOptions): Promise<void>

  async delete(
    nameOrOptions: string | CookieStoreDeleteOptions
  ): Promise<void> {
    const entry = entryFromDeleteOptions(nameOrOptions)
    const key = cookieIdentity(entry)

    this.#removeMatchingEntries(entry)

    this.#setCookieHeaders.set(key, serializeDeleteCookie(entry))
  }

  /**
   * Returns the pending `Set-Cookie` header values collected during mutations.
   * @returns Pending `Set-Cookie` header values.
   */
  getSetCookieHeaders() {
    return [...this.#setCookieHeaders.values()]
  }

  /**
   * Returns and clears the pending `Set-Cookie` header values.
   * @returns Pending `Set-Cookie` header values.
   */
  drainSetCookieHeaders() {
    const headers = this.getSetCookieHeaders()

    this.#setCookieHeaders.clear()

    return headers
  }

  #assertUrl(url?: string) {
    if (!url || !this.#requestUrl) {
      return
    }

    const resolved = new URL(url, this.#requestUrl)

    if (resolved.href !== this.#requestUrl.href) {
      throw new TypeError('This virtual cookie store is bound to a single request URL.')
    }
  }

  #removeMatchingEntries(target: CookieEntry) {
    for (let i = this.#entries.length - 1; i >= 0; i--) {
      const entry = this.#entries[i]

      if (
        entry.name === target.name
        && (
          !entry.knownScope
          || !target.knownScope
          || cookieIdentity(entry) === cookieIdentity(target)
        )
      ) {
        this.#entries.splice(i, 1)
      }
    }
  }
}

function entryFromCookieInit(
  nameOrOptions: string | VirtualCookieInit,
  value: string | undefined
): CookieEntry {
  const options = typeof nameOrOptions === 'string'
    ? {
      name: nameOrOptions,
      value: value ?? ''
    }
    : nameOrOptions
  const maxAge = normalizeMaxAge(options.maxAge)

  return {
    knownScope: true,
    name: options.name,
    value: options.value,
    domain: normalizeDomain(options.domain),
    expires: normalizeExpires(options.expires, maxAge),
    maxAge,
    partitioned: Boolean(options.partitioned),
    path: normalizePath(options.path),
    sameSite: options.sameSite,
    secure: Boolean(options.secure)
  }
}

function entryFromDeleteOptions(
  nameOrOptions: string | CookieStoreDeleteOptions
): CookieEntry {
  const options = typeof nameOrOptions === 'string'
    ? {
      name: nameOrOptions
    }
    : nameOrOptions

  return {
    knownScope: true,
    name: options.name,
    value: '',
    domain: normalizeDomain(options.domain),
    expires: 0,
    maxAge: 0,
    partitioned: Boolean(options.partitioned),
    path: normalizePath(options.path),
    secure: false
  }
}

function cookieIdentity(entry: CookieEntry) {
  return `${entry.name};${entry.domain ?? ''};${entry.path ?? ''};${entry.partitioned ? '1' : '0'}`
}

function toCookieListItem(entry: CookieEntry): VirtualCookieListItem {
  const item: VirtualCookieListItem = {
    name: entry.name,
    value: entry.value
  }

  if (!entry.knownScope) {
    return item
  }

  if (entry.domain !== null) {
    item.domain = entry.domain
  }

  if (entry.expires !== null) {
    item.expires = entry.expires
  }

  if (entry.partitioned) {
    item.partitioned = true
  }

  if (entry.path !== null) {
    item.path = entry.path
  }

  if (entry.sameSite) {
    item.sameSite = entry.sameSite
  }

  if (entry.secure) {
    item.secure = true
  }

  return item
}
