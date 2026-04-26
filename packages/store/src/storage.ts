import {
  type WritableSignal,
  mountable,
  onStart,
  isFunction,
  signalNextValue
} from 'kida'
import type { RateLimiter } from './types.js'
import { external } from './external.js'
import { noLimit } from './utils.js'
import {
  type Codec,
  isCodec,
  NoopCodec
} from './codec.js'

export interface Storage<T> {
  /** Reads a raw value by key. */
  get(key: string): T | null
  /** Writes a raw value by key. */
  set(key: string, value: T): void
}

export interface SyncedStorage<T> extends Storage<T> {
  /**
   * Subscribes to external raw value changes for the given key.
   *
   * Returns an unsubscribe function.
   */
  sub(key: string, callback: (value: T | null) => void): () => void
}

/**
 * No-op fallback for unsupported environments.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const noopStorage: SyncedStorage<any> = {
  get() {
    return null
  },
  set() { /* no op */ },
  sub() {
    return () => { /* no op */ }
  }
}

function args<D, E>(
  defaultValueOrCodecOrRateLimiter?: D | Codec<D, E> | RateLimiter,
  codecOrRateLimiter?: Codec<D, E> | RateLimiter,
  maybeRateLimiter: RateLimiter = noLimit
) {
  let defaultValue: D | undefined
  let codec = NoopCodec as Codec<D, E>
  let rateLimiter = maybeRateLimiter

  if (isCodec(defaultValueOrCodecOrRateLimiter)) {
    codec = defaultValueOrCodecOrRateLimiter

    if (codecOrRateLimiter) {
      rateLimiter = codecOrRateLimiter as RateLimiter
    }
  } else if (isFunction(defaultValueOrCodecOrRateLimiter)) {
    rateLimiter = defaultValueOrCodecOrRateLimiter
  } else {
    defaultValue = defaultValueOrCodecOrRateLimiter

    if (isCodec(codecOrRateLimiter)) {
      codec = codecOrRateLimiter
    } else if (codecOrRateLimiter) {
      rateLimiter = codecOrRateLimiter
    }
  }

  return [
    defaultValue,
    codec,
    rateLimiter
  ] as const
}

/**
 * Creates a writable signal backed by a storage adapter.
 * @param storage - Storage adapter.
 * @param key - Storage key.
 * @returns A writable signal synchronized with the provided storage entry.
 */
export function stored<E>(
  storage: Storage<E>,
  key: string
): WritableSignal<E | undefined>

/**
 * Creates a writable signal backed by a storage adapter.
 * @param storage - Storage adapter.
 * @param key - Storage key.
 * @param rateLimiter - Write rate limiter.
 * @returns A writable signal synchronized with the provided storage entry.
 */
export function stored<E>(
  storage: Storage<E>,
  key: string,
  rateLimiter: RateLimiter
): WritableSignal<E | undefined>

/**
 * Creates a writable signal backed by a storage adapter and decodes
 * raw values with the provided codec.
 * @param storage - Storage adapter.
 * @param key - Storage key.
 * @param codec - Codec used to decode and encode stored values.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with the provided storage entry.
 */
export function stored<D, E>(
  storage: Storage<E>,
  key: string,
  codec: Codec<D, E>,
  rateLimiter?: RateLimiter
): WritableSignal<D | undefined>

/**
 * Creates a writable signal backed by a storage adapter with a default value.
 * @param storage - Storage adapter.
 * @param key - Storage key.
 * @param defaultValue - Default value used when the key is missing.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with the provided storage entry.
 */
export function stored<D, E>(
  storage: Storage<E>,
  key: string,
  defaultValue: D,
  rateLimiter?: RateLimiter
): WritableSignal<D>

/**
 * Creates a writable signal backed by a storage adapter with a default
 * value and a codec.
 * @param storage - Storage adapter.
 * @param key - Storage key.
 * @param defaultValue - Default value used when the key is missing.
 * @param codec - Codec used to decode and encode stored values.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with the provided storage entry.
 */
export function stored<D, E>(
  storage: Storage<E>,
  key: string,
  defaultValue: D,
  codec: Codec<NoInfer<D>, E>,
  rateLimiter?: RateLimiter
): WritableSignal<D>

export function stored<D, E>(
  storage: Storage<E>,
  key: string,
  defaultValueOrCodecOrRateLimiter?: D | Codec<NoInfer<D>, E> | RateLimiter,
  codecOrRateLimiter?: Codec<NoInfer<D>, E> | RateLimiter,
  rateLimiter?: RateLimiter
): WritableSignal<D | undefined>

/* @__NO_SIDE_EFFECTS__ */
export function stored<D, E>(
  storage: Storage<E>,
  key: string,
  defaultValueOrCodecOrRateLimiter?: D | Codec<D, E> | RateLimiter,
  codecOrRateLimiter?: Codec<D, E> | RateLimiter,
  maybeRateLimiter?: RateLimiter
) {
  const [defaultValue, codec, rateLimiter] = args(
    defaultValueOrCodecOrRateLimiter,
    codecOrRateLimiter,
    maybeRateLimiter
  )
  const set = rateLimiter(storage.set.bind(storage))

  return external<D | undefined>(($signal, ops) => {
    $signal(codec.decode(storage.get(key)) ?? defaultValue)

    ops.set = (newValue) => {
      const value = signalNextValue($signal, newValue)

      set(key, codec.encode(value as D))
      $signal(value ?? defaultValue)
    }
  })
}

/**
 * Creates a writable signal backed by a synced storage adapter.
 * @param storage - Synced storage adapter.
 * @param key - Storage key.
 * @returns A writable signal synchronized with the provided storage entry.
 */
export function syncedStored<E>(
  storage: SyncedStorage<E>,
  key: string
): WritableSignal<E | undefined>

/**
 * Creates a writable signal backed by a synced storage adapter.
 * @param storage - Synced storage adapter.
 * @param key - Storage key.
 * @param rateLimiter - Write rate limiter.
 * @returns A writable signal synchronized with the provided storage entry.
 */
export function syncedStored<E>(
  storage: SyncedStorage<E>,
  key: string,
  rateLimiter: RateLimiter
): WritableSignal<E | undefined>

/**
 * Creates a writable signal backed by a synced storage adapter and
 * decodes raw values with the provided codec.
 * @param storage - Synced storage adapter.
 * @param key - Storage key.
 * @param codec - Codec used to decode and encode stored values.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with the provided storage entry.
 */
export function syncedStored<D, E>(
  storage: SyncedStorage<E>,
  key: string,
  codec: Codec<D, E>,
  rateLimiter?: RateLimiter
): WritableSignal<D | undefined>

/**
 * Creates a writable signal backed by a synced storage adapter with a
 * default value.
 * @param storage - Synced storage adapter.
 * @param key - Storage key.
 * @param defaultValue - Default value used when the key is missing.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with the provided storage entry.
 */
export function syncedStored<D, E>(
  storage: SyncedStorage<E>,
  key: string,
  defaultValue: D,
  rateLimiter?: RateLimiter
): WritableSignal<D>

/**
 * Creates a writable signal backed by a synced storage adapter with a
 * default value and a codec.
 * @param storage - Synced storage adapter.
 * @param key - Storage key.
 * @param defaultValue - Default value used when the key is missing.
 * @param codec - Codec used to decode and encode stored values.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with the provided storage entry.
 */
export function syncedStored<D, E>(
  storage: SyncedStorage<E>,
  key: string,
  defaultValue: D,
  codec: Codec<NoInfer<D>, E>,
  rateLimiter?: RateLimiter
): WritableSignal<D>

export function syncedStored<D, E>(
  storage: SyncedStorage<E>,
  key: string,
  defaultValueOrCodecOrRateLimiter?: D | Codec<NoInfer<D>, E> | RateLimiter,
  codecOrRateLimiter?: Codec<NoInfer<D>, E> | RateLimiter,
  rateLimiter?: RateLimiter
): WritableSignal<D | undefined>

/* @__NO_SIDE_EFFECTS__ */
export function syncedStored<D, E>(
  storage: SyncedStorage<E>,
  key: string,
  defaultValueOrCodecOrRateLimiter?: D | Codec<D, E> | RateLimiter,
  codecOrRateLimiter?: Codec<D, E> | RateLimiter,
  maybeRateLimiter?: RateLimiter
) {
  const [defaultValue, codec, rateLimiter] = args(
    defaultValueOrCodecOrRateLimiter,
    codecOrRateLimiter,
    maybeRateLimiter
  )
  const set = rateLimiter(storage.set.bind(storage))
  let prevRawValue: E | null = null

  return external<D | undefined>(($signal, ops) => {
    $signal(codec.decode(prevRawValue = storage.get(key)) ?? defaultValue)

    onStart(mountable($signal), () => storage.sub(key, (rawValue) => {
      if (rawValue === null) {
        $signal(defaultValue)
      } else if (rawValue !== prevRawValue) {
        $signal(codec.decode(prevRawValue = rawValue) ?? defaultValue)
      }
    }))

    ops.set = (newValue) => {
      const value = signalNextValue($signal, newValue)

      set(key, prevRawValue = codec.encode(value as D))
      $signal(value ?? defaultValue)
    }
  })
}
