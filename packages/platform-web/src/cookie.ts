/* eslint-disable max-classes-per-file */
import {
  type Codec,
  type RateLimiter,
  type Storage,
  type SyncedStorage,
  type WritableSignal,
  stored,
  syncedStored
} from '@nano_kit/store'

export interface CookieOptions extends Omit<CookieInit, 'value'> {
  maxAge?: number
}

interface MaybeVirtualCookieStore {
  peek?(name: string): string | null
}

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))

  return match ? decodeURIComponent(match[2]) : null
}

class CookieStorage implements Storage<string> {
  store: CookieStore & MaybeVirtualCookieStore
  readonly #options: Partial<CookieOptions>

  constructor(
    cookieStore: CookieStore & MaybeVirtualCookieStore,
    options: Partial<CookieOptions>
  ) {
    this.store = cookieStore
    this.#options = options
  }

  get(key: string) {
    const { store } = this

    return store.peek
      ? store.peek(key)
      : getCookie(key)
  }

  set(key: string, value: string) {
    const {
      expires,
      maxAge,
      ...options
    } = this.#options

    void this.store.set({
      ...options,
      name: key,
      value,
      expires: maxAge
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        ? Date.now() + maxAge * 1000
        : expires
    })
  }
}

class SyncedCookieStorage extends CookieStorage implements SyncedStorage<string> {
  sub(key: string, callback: (value: string | null) => void) {
    const { store } = this
    const forEach = (list: readonly CookieListItem[]) => {
      for (const cookie of list) {
        if (cookie.name === key) {
          callback(cookie.value ?? null)
          return true
        }
      }

      return false
    }
    const listener = (event: CookieChangeEvent) => forEach(event.changed) || forEach(event.deleted)

    store.addEventListener('change', listener)

    return () => store.removeEventListener('change', listener)
  }
}

/**
 * Creates a writable signal backed by a cookie store.
 * @param cookieStore - Cookie store used for reads and writes.
 * @param nameOrOptions - Cookie name or cookie options.
 * @returns A writable signal synchronized with the cookie value.
 */
export function cookieStored(
  cookieStore: CookieStore & MaybeVirtualCookieStore,
  nameOrOptions: string | CookieOptions
): WritableSignal<string | undefined>

/**
 * Creates a writable signal backed by a cookie store.
 * @param cookieStore - Cookie store used for reads and writes.
 * @param nameOrOptions - Cookie name or cookie options.
 * @param rateLimiter - Write rate limiter.
 * @returns A writable signal synchronized with the cookie value.
 */
export function cookieStored(
  cookieStore: CookieStore & MaybeVirtualCookieStore,
  nameOrOptions: string | CookieOptions,
  rateLimiter: RateLimiter
): WritableSignal<string | undefined>

/**
 * Creates a writable signal backed by a cookie store using a codec.
 * @param cookieStore - Cookie store used for reads and writes.
 * @param nameOrOptions - Cookie name or cookie options.
 * @param codec - Codec used to decode and encode cookie values.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with the cookie value.
 */
export function cookieStored<T>(
  cookieStore: CookieStore & MaybeVirtualCookieStore,
  nameOrOptions: string | CookieOptions,
  codec: Codec<T, string>,
  rateLimiter?: RateLimiter
): WritableSignal<T | undefined>

/**
 * Creates a writable signal backed by a cookie store with a default value.
 * @param cookieStore - Cookie store used for reads and writes.
 * @param nameOrOptions - Cookie name or cookie options.
 * @param defaultValue - Default value used when the cookie is missing.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with the cookie value.
 */
export function cookieStored<T>(
  cookieStore: CookieStore & MaybeVirtualCookieStore,
  nameOrOptions: string | CookieOptions,
  defaultValue: T,
  rateLimiter?: RateLimiter
): WritableSignal<T>

/**
 * Creates a writable signal backed by a cookie store with a default value and a codec.
 * @param cookieStore - Cookie store used for reads and writes.
 * @param nameOrOptions - Cookie name or cookie options.
 * @param defaultValue - Default value used when the cookie is missing.
 * @param codec - Codec used to decode and encode cookie values.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with the cookie value.
 */
export function cookieStored<T>(
  cookieStore: CookieStore & MaybeVirtualCookieStore,
  nameOrOptions: string | CookieOptions,
  defaultValue: T,
  codec: Codec<NoInfer<T>, string>,
  rateLimiter?: RateLimiter
): WritableSignal<T>

/* @__NO_SIDE_EFFECTS__ */
export function cookieStored<T>(
  cookieStore: CookieStore & MaybeVirtualCookieStore,
  nameOrOptions: string | CookieOptions,
  defaultValueOrCodecOrRateLimiter?: T | Codec<T, string> | RateLimiter,
  codecOrRateLimiter?: Codec<T, string> | RateLimiter,
  rateLimiter?: RateLimiter
) {
  let name: string
  let options: Partial<CookieOptions>

  if (typeof nameOrOptions === 'string') {
    name = nameOrOptions
    options = {}
  } else {
    name = nameOrOptions.name
    options = nameOrOptions
  }

  return stored(
    new CookieStorage(cookieStore, options),
    name,
    defaultValueOrCodecOrRateLimiter,
    codecOrRateLimiter,
    rateLimiter
  )
}

/**
 * Creates a writable signal backed by a synced cookie store.
 * @param cookieStore - Cookie store used for reads, writes, and change events.
 * @param nameOrOptions - Cookie name or cookie options.
 * @returns A writable signal synchronized with the cookie value.
 */
export function syncedCookieStored(
  cookieStore: CookieStore & MaybeVirtualCookieStore,
  nameOrOptions: string | CookieOptions
): WritableSignal<string | undefined>

/**
 * Creates a writable signal backed by a synced cookie store.
 * @param cookieStore - Cookie store used for reads, writes, and change events.
 * @param nameOrOptions - Cookie name or cookie options.
 * @param rateLimiter - Write rate limiter.
 * @returns A writable signal synchronized with the cookie value.
 */
export function syncedCookieStored(
  cookieStore: CookieStore & MaybeVirtualCookieStore,
  nameOrOptions: string | CookieOptions,
  rateLimiter: RateLimiter
): WritableSignal<string | undefined>

/**
 * Creates a writable signal backed by a synced cookie store using a codec.
 * @param cookieStore - Cookie store used for reads, writes, and change events.
 * @param nameOrOptions - Cookie name or cookie options.
 * @param codec - Codec used to decode and encode cookie values.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with the cookie value.
 */
export function syncedCookieStored<T>(
  cookieStore: CookieStore & MaybeVirtualCookieStore,
  nameOrOptions: string | CookieOptions,
  codec: Codec<T, string>,
  rateLimiter?: RateLimiter
): WritableSignal<T | undefined>

/**
 * Creates a writable signal backed by a synced cookie store with a default value.
 * @param cookieStore - Cookie store used for reads, writes, and change events.
 * @param nameOrOptions - Cookie name or cookie options.
 * @param defaultValue - Default value used when the cookie is missing.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with the cookie value.
 */
export function syncedCookieStored<T>(
  cookieStore: CookieStore & MaybeVirtualCookieStore,
  nameOrOptions: string | CookieOptions,
  defaultValue: T,
  rateLimiter?: RateLimiter
): WritableSignal<T>

/**
 * Creates a writable signal backed by a synced cookie store with a default value and a codec.
 * @param cookieStore - Cookie store used for reads, writes, and change events.
 * @param nameOrOptions - Cookie name or cookie options.
 * @param defaultValue - Default value used when the cookie is missing.
 * @param codec - Codec used to decode and encode cookie values.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with the cookie value.
 */
export function syncedCookieStored<T>(
  cookieStore: CookieStore & MaybeVirtualCookieStore,
  nameOrOptions: string | CookieOptions,
  defaultValue: T,
  codec: Codec<NoInfer<T>, string>,
  rateLimiter?: RateLimiter
): WritableSignal<T>

/* @__NO_SIDE_EFFECTS__ */
export function syncedCookieStored<T>(
  cookieStore: CookieStore & MaybeVirtualCookieStore,
  nameOrOptions: string | CookieOptions,
  defaultValueOrCodecOrRateLimiter?: T | Codec<T, string> | RateLimiter,
  codecOrRateLimiter?: Codec<T, string> | RateLimiter,
  rateLimiter?: RateLimiter
) {
  let name: string
  let options: Partial<CookieOptions>

  if (typeof nameOrOptions === 'string') {
    name = nameOrOptions
    options = {}
  } else {
    name = nameOrOptions.name
    options = nameOrOptions
  }

  return syncedStored(
    new SyncedCookieStorage(cookieStore, options),
    name,
    defaultValueOrCodecOrRateLimiter,
    codecOrRateLimiter,
    rateLimiter
  )
}
