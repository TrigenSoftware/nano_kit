/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {
  Codec,
  RateLimiter,
  Storage,
  SyncedStorage,
  WritableSignal
} from '@nano_kit/store'
import {
  noopStorage,
  stored,
  syncedStored
} from '@nano_kit/store'

let sessionStorageAdapter: Storage<string> = noopStorage
let syncedSessionStorageAdapter: SyncedStorage<string> = noopStorage

try {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorageAdapter = {
      get(key) {
        return sessionStorage[key] as string | null
      },
      set(key, value) {
        sessionStorage[key] = value
      }
    }
    syncedSessionStorageAdapter = {
      ...sessionStorageAdapter,
      sub(key, callback) {
        const listener = (event: StorageEvent) => {
          if (event.key === key && event.storageArea === sessionStorage) {
            callback(event.newValue)
          }
        }
        const restore = () => {
          callback(sessionStorage[key] as string | null)
        }

        window.addEventListener('storage', listener)
        window.addEventListener('pageshow', restore)

        return () => {
          window.removeEventListener('storage', listener)
          window.removeEventListener('pageshow', restore)
        }
      }
    }
  }
} catch {}

/**
 * Creates a writable signal backed by `sessionStorage`.
 * @param key - Storage key.
 * @returns A writable signal synchronized with `sessionStorage`.
 */
export function sessionStored(
  key: string
): WritableSignal<string | undefined>

/**
 * Creates a writable signal backed by `sessionStorage`.
 * @param key - Storage key.
 * @param rateLimiter - Write rate limiter.
 * @returns A writable signal synchronized with `sessionStorage`.
 */
export function sessionStored(
  key: string,
  rateLimiter: RateLimiter
): WritableSignal<string | undefined>

/**
 * Creates a writable signal backed by `sessionStorage` using a codec.
 * @param key - Storage key.
 * @param codec - Codec used to decode and encode stored values.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with `sessionStorage`.
 */
export function sessionStored<T>(
  key: string,
  codec: Codec<T, string>,
  rateLimiter?: RateLimiter
): WritableSignal<T | undefined>

/**
 * Creates a writable signal backed by `sessionStorage` with a default value.
 * @param key - Storage key.
 * @param defaultValue - Default value used when the key is missing.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with `sessionStorage`.
 */
export function sessionStored<T>(
  key: string,
  defaultValue: T,
  rateLimiter?: RateLimiter
): WritableSignal<T>

/**
 * Creates a writable signal backed by `sessionStorage` with a default value and a codec.
 * @param key - Storage key.
 * @param defaultValue - Default value used when the key is missing.
 * @param codec - Codec used to decode and encode stored values.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with `sessionStorage`.
 */
export function sessionStored<T>(
  key: string,
  defaultValue: T,
  codec: Codec<NoInfer<T>, string>,
  rateLimiter?: RateLimiter
): WritableSignal<T>

/* @__NO_SIDE_EFFECTS__ */
export function sessionStored<T>(
  key: string,
  defaultValueOrCodecOrRateLimiter?: T | Codec<T, string> | RateLimiter,
  codecOrRateLimiter?: Codec<T, string> | RateLimiter,
  rateLimiter?: RateLimiter
) {
  return stored(
    sessionStorageAdapter,
    key,
    defaultValueOrCodecOrRateLimiter,
    codecOrRateLimiter,
    rateLimiter
  )
}

/**
 * Creates a writable signal backed by synced `sessionStorage`.
 * @param key - Storage key.
 * @returns A writable signal synchronized with `sessionStorage`.
 */
export function syncedSessionStored(
  key: string
): WritableSignal<string | undefined>

/**
 * Creates a writable signal backed by synced `sessionStorage`.
 * @param key - Storage key.
 * @param rateLimiter - Write rate limiter.
 * @returns A writable signal synchronized with `sessionStorage`.
 */
export function syncedSessionStored(
  key: string,
  rateLimiter: RateLimiter
): WritableSignal<string | undefined>

/**
 * Creates a writable signal backed by synced `sessionStorage` using a codec.
 * @param key - Storage key.
 * @param codec - Codec used to decode and encode stored values.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with `sessionStorage`.
 */
export function syncedSessionStored<T>(
  key: string,
  codec: Codec<T, string>,
  rateLimiter?: RateLimiter
): WritableSignal<T | undefined>

/**
 * Creates a writable signal backed by synced `sessionStorage` with a default value.
 * @param key - Storage key.
 * @param defaultValue - Default value used when the key is missing.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with `sessionStorage`.
 */
export function syncedSessionStored<T>(
  key: string,
  defaultValue: T,
  rateLimiter?: RateLimiter
): WritableSignal<T>

/**
 * Creates a writable signal backed by synced `sessionStorage` with a default value and a codec.
 * @param key - Storage key.
 * @param defaultValue - Default value used when the key is missing.
 * @param codec - Codec used to decode and encode stored values.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with `sessionStorage`.
 */
export function syncedSessionStored<T>(
  key: string,
  defaultValue: T,
  codec: Codec<NoInfer<T>, string>,
  rateLimiter?: RateLimiter
): WritableSignal<T>

/* @__NO_SIDE_EFFECTS__ */
export function syncedSessionStored<T>(
  key: string,
  defaultValueOrCodecOrRateLimiter?: T | Codec<T, string> | RateLimiter,
  codecOrRateLimiter?: Codec<T, string> | RateLimiter,
  rateLimiter?: RateLimiter
) {
  return syncedStored(
    syncedSessionStorageAdapter,
    key,
    defaultValueOrCodecOrRateLimiter,
    codecOrRateLimiter,
    rateLimiter
  )
}
