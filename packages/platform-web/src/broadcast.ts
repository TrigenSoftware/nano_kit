import {
  type Codec,
  type RateLimiter,
  type SyncedStorage,
  type WritableSignal,
  syncedStored
} from '@nano_kit/store'

class BroadcastChannelStorage<T> implements SyncedStorage<T> {
  #channel: BroadcastChannel | null = null

  get() {
    return null
  }

  set(_key: string, value: T) {
    this.#channel?.postMessage(value)
  }

  sub(key: string, callback: (value: T | null) => void) {
    if (typeof BroadcastChannel === 'undefined') {
      return () => { /* noop */ }
    }

    const channel = this.#channel = new BroadcastChannel(key)

    channel.onmessage = event => callback(event.data as T)

    return () => {
      channel.close()
      this.#channel = null
    }
  }
}

/**
 * Creates a writable signal synchronized through `BroadcastChannel`.
 * @param name - Broadcast channel name.
 * @returns A writable signal synchronized with channel messages.
 */
export function broadcasted<E>(
  name: string
): WritableSignal<E | undefined>

/**
 * Creates a writable signal synchronized through `BroadcastChannel`.
 * @param name - Broadcast channel name.
 * @param rateLimiter - Write rate limiter.
 * @returns A writable signal synchronized with channel messages.
 */
export function broadcasted<E>(
  name: string,
  rateLimiter: RateLimiter
): WritableSignal<E | undefined>

/**
 * Creates a writable signal synchronized through `BroadcastChannel` using a codec.
 * @param name - Broadcast channel name.
 * @param codec - Codec used to decode and encode channel messages.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with channel messages.
 */
export function broadcasted<D, E>(
  name: string,
  codec: Codec<D, E>,
  rateLimiter?: RateLimiter
): WritableSignal<D | undefined>

/**
 * Creates a writable signal synchronized through `BroadcastChannel` with a default value.
 * @param name - Broadcast channel name.
 * @param defaultValue - Default value used before a message is received.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with channel messages.
 */
export function broadcasted<D>(
  name: string,
  defaultValue: D,
  rateLimiter?: RateLimiter
): WritableSignal<D>

/**
 * Creates a writable signal synchronized through `BroadcastChannel` with a default value and a codec.
 * @param name - Broadcast channel name.
 * @param defaultValue - Default value used before a message is received.
 * @param codec - Codec used to decode and encode channel messages.
 * @param rateLimiter - Optional write rate limiter.
 * @returns A writable signal synchronized with channel messages.
 */
export function broadcasted<D, E>(
  name: string,
  defaultValue: D,
  codec: Codec<NoInfer<D>, E>,
  rateLimiter?: RateLimiter
): WritableSignal<D>

/* @__NO_SIDE_EFFECTS__ */
export function broadcasted<D, E = D>(
  name: string,
  defaultValueOrCodecOrRateLimiter?: D | Codec<D, E> | RateLimiter,
  codecOrRateLimiter?: Codec<D, E> | RateLimiter,
  rateLimiter?: RateLimiter
) {
  return syncedStored(
    new BroadcastChannelStorage<E>(),
    name,
    defaultValueOrCodecOrRateLimiter,
    codecOrRateLimiter,
    rateLimiter
  )
}
