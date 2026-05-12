import type { Cookies } from '@sveltejs/kit'

class ServerCookieStore implements CookieStore {
  readonly #cookies: Cookies
  onchange: ((event: unknown) => unknown) | null = null

  constructor(cookies: Cookies) {
    this.#cookies = cookies
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
  get(name: string): Promise<CookieListItem | null>
  /**
   * Returns the first cookie matching the provided lookup options.
   * @param options - Cookie lookup options.
   * @returns The first matching cookie, or `null` if none was found.
   */
  get(options?: CookieStoreGetOptions): Promise<CookieListItem | null>
  get(nameOrOptions?: string | CookieStoreGetOptions): Promise<CookieListItem | null>

  async get(
    nameOrOptions: string | CookieStoreGetOptions = {}
  ): Promise<CookieListItem | null> {
    const name = getCookieName(nameOrOptions)!
    const value = this.#cookies.get(name)

    return value === undefined
      ? null
      : {
        name,
        value
      }
  }

  /**
   * Returns all cookies matching the provided name.
   * @param name - Cookie name.
   * @returns Matching cookies in their current in-store order.
   */
  getAll(name: string): Promise<CookieList>
  /**
   * Returns all cookies matching the provided lookup options.
   * @param options - Cookie lookup options.
   * @returns Matching cookies in their current in-store order.
   */
  getAll(options?: CookieStoreGetOptions): Promise<CookieList>
  getAll(nameOrOptions?: string | CookieStoreGetOptions): Promise<CookieList>

  async getAll(
    nameOrOptions: string | CookieStoreGetOptions = {}
  ): Promise<CookieList> {
    const name = getCookieName(nameOrOptions)
    const cookies = this.#cookies.getAll()

    return name
      ? cookies.filter(cookie => cookie.name === name)
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
  set(options: CookieInit): Promise<void>
  set(nameOrOptions: string | CookieInit, value?: string): Promise<void>

  async set(
    nameOrOptions: string | CookieInit,
    maybeValue?: string
  ): Promise<void> {
    const options = typeof nameOrOptions === 'string'
      ? {
        name: nameOrOptions,
        value: maybeValue!
      }
      : nameOrOptions

    this.#cookies.set(options.name, options.value, toCookieOptions(options))
  }

  /**
   * Deletes a cookie by name.
   * @param name - Cookie name.
   */
  delete(name: string): Promise<void>
  /**
   * Deletes a cookie using deletion options.
   * @param options - Cookie deletion options.
   */
  delete(options: CookieStoreDeleteOptions): Promise<void>
  delete(nameOrOptions: string | CookieStoreDeleteOptions): Promise<void>

  async delete(
    nameOrOptions: string | CookieStoreDeleteOptions
  ): Promise<void> {
    const options = typeof nameOrOptions === 'string'
      ? {
        name: nameOrOptions
      }
      : nameOrOptions

    this.#cookies.delete(options.name, toCookieOptions(options))
  }
}

function getCookieName(nameOrOptions?: string | CookieStoreGetOptions) {
  return typeof nameOrOptions === 'string'
    ? nameOrOptions
    : nameOrOptions?.name
}

function toCookieOptions(
  options: Partial<CookieInit & CookieStoreDeleteOptions>
): Parameters<Cookies['set']>[2] {
  return {
    domain: options.domain ?? undefined,
    expires: typeof options.expires === 'number'
      ? new Date(options.expires)
      : undefined,
    httpOnly: false,
    partitioned: options.partitioned,
    path: options.path || '/',
    sameSite: options.sameSite
  }
}

export { ServerCookieStore as CookieStore }
