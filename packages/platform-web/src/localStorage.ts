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

let localStorageAdapter: Storage<string> = noopStorage
let syncedLocalStorageAdapter: SyncedStorage<string> = noopStorage

try {
  if (typeof localStorage !== 'undefined') {
    localStorageAdapter = {
      get(key) {
        return localStorage[key] as string | null
      },
      set(key, value) {
        localStorage[key] = value
      }
    }
    syncedLocalStorageAdapter = {
      ...localStorageAdapter,
      sub(key, callback) {
        const listener = (event: StorageEvent) => {
          if (event.key === key && event.storageArea === localStorage) {
            callback(event.newValue)
          }
        }
        const restore = () => {
          callback(localStorage[key] as string | null)
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
 * Creates a writable signal backed by `localStorage`.
 * @param key - Storage key.
 * @returns A writable signal synchronized with `localStorage`.
 */
export function localStored(
  key: string
): WritableSignal<string | undefined>

/**
 * Creates a writable signal backed by `localStorage`.
 * @param key - Storage key.
 * @param rateLimiter - Write rate limiter.
 * @returns A writable signal synchronized with `localStorage`.
 */
export function localStored(
  key: string,
  rateLimiter: RateLimiter
): WritableSignal<string | undefined>

/**
 * Creates a writable signal backed by `localStorage` using a codec.
 * @param key - Storage key.
 * @param codec - Codec used to decode and encode stored values.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with `localStorage`.
 */
export function localStored<T>(
  key: string,
  codec: Codec<T, string>,
  rateLimiter?: RateLimiter
): WritableSignal<T | undefined>

/**
 * Creates a writable signal backed by `localStorage` with a default value.
 * @param key - Storage key.
 * @param defaultValue - Default value used when the key is missing.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with `localStorage`.
 */
export function localStored<T>(
  key: string,
  defaultValue: T,
  rateLimiter?: RateLimiter
): WritableSignal<T>

/**
 * Creates a writable signal backed by `localStorage` with a default value and a codec.
 * @param key - Storage key.
 * @param defaultValue - Default value used when the key is missing.
 * @param codec - Codec used to decode and encode stored values.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with `localStorage`.
 */
export function localStored<T>(
  key: string,
  defaultValue: T,
  codec: Codec<NoInfer<T>, string>,
  rateLimiter?: RateLimiter
): WritableSignal<T>

/* @__NO_SIDE_EFFECTS__ */
export function localStored<T>(
  key: string,
  defaultValueOrCodecOrRateLimiter?: T | Codec<T, string> | RateLimiter,
  codecOrRateLimiter?: Codec<T, string> | RateLimiter,
  rateLimiter?: RateLimiter
) {
  return stored(
    localStorageAdapter,
    key,
    defaultValueOrCodecOrRateLimiter,
    codecOrRateLimiter,
    rateLimiter
  )
}

/**
 * Creates a writable signal backed by synced `localStorage`.
 * @param key - Storage key.
 * @returns A writable signal synchronized with `localStorage`.
 */
export function syncedLocalStored(
  key: string
): WritableSignal<string | undefined>

/**
 * Creates a writable signal backed by synced `localStorage`.
 * @param key - Storage key.
 * @param rateLimiter - Write rate limiter.
 * @returns A writable signal synchronized with `localStorage`.
 */
export function syncedLocalStored(
  key: string,
  rateLimiter: RateLimiter
): WritableSignal<string | undefined>

/**
 * Creates a writable signal backed by synced `localStorage` using a codec.
 * @param key - Storage key.
 * @param codec - Codec used to decode and encode stored values.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with `localStorage`.
 */
export function syncedLocalStored<T>(
  key: string,
  codec: Codec<T, string>,
  rateLimiter?: RateLimiter
): WritableSignal<T | undefined>

/**
 * Creates a writable signal backed by synced `localStorage` with a default value.
 * @param key - Storage key.
 * @param defaultValue - Default value used when the key is missing.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with `localStorage`.
 */
export function syncedLocalStored<T>(
  key: string,
  defaultValue: T,
  rateLimiter?: RateLimiter
): WritableSignal<T>

/**
 * Creates a writable signal backed by synced `localStorage` with a default value and a codec.
 * @param key - Storage key.
 * @param defaultValue - Default value used when the key is missing.
 * @param codec - Codec used to decode and encode stored values.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with `localStorage`.
 */
export function syncedLocalStored<T>(
  key: string,
  defaultValue: T,
  codec: Codec<NoInfer<T>, string>,
  rateLimiter?: RateLimiter
): WritableSignal<T>

/* @__NO_SIDE_EFFECTS__ */
export function syncedLocalStored<T>(
  key: string,
  defaultValueOrCodecOrRateLimiter?: T | Codec<T, string> | RateLimiter,
  codecOrRateLimiter?: Codec<T, string> | RateLimiter,
  rateLimiter?: RateLimiter
) {
  return syncedStored(
    syncedLocalStorageAdapter,
    key,
    defaultValueOrCodecOrRateLimiter,
    codecOrRateLimiter,
    rateLimiter
  )
}
