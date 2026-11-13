import type {
  AnyCodec,
  ReadableSignal,
  Accessor
} from '@nano_kit/store'
import type { ClientSetting } from './client.types.js'
import type { RequestContext } from './RequestContext.js'
import {
  type CacheKey,
  type CacheEntry,
  CacheStorage
} from './CacheStorage.js'
import {
  addFn,
  settle
} from './utils.js'

export type OnEveryError = (error: unknown, stopped: boolean) => void

export class ClientContext<T = unknown> extends CacheStorage {
  $key?: ReadableSignal<CacheKey>
  $disabled?: Accessor<boolean>
  loadingDedupe = true
  timeDedupe = true
  onEveryError: OnEveryError | undefined
  codec?: AnyCodec

  task<T>(promise: Promise<T>): Promise<T> {
    return promise
  }

  mapData(data: T): T {
    return data
  }

  mapComputedData(data: T | null): T | null {
    return data
  }

  mapError(error: unknown) {
    return (error as Error)?.message
  }

  mounted() {}

  override mute(entry: CacheEntry) {
    return (
      this.$disabled?.()
      || super.mute(entry, this.loadingDedupe, this.timeDedupe)
    )
  }

  run(
    requestCtx: RequestContext<T>,
    start: () => Promise<T>,
    onSettled: (data: T | null, error: string | null) => void,
    interrupt?: (error: unknown) => boolean
  ) {
    const {
      mapData,
      mapError
    } = this

    return requestCtx.promise = this.task(settle(start(), (data, error) => {
      // Unlink the previous request: the chain holds only requests in flight
      requestCtx.prevCtx = undefined

      if (error && interrupt?.(error)) {
        return
      }

      const mappedData = mapData(data as T)
      const dataOrNull = error ? null : mappedData
      const errorString = error ? mapError(error) : null

      onSettled(dataOrNull, errorString)
      requestCtx.settled(mappedData, error)

      if (error !== undefined) {
        this.onEveryError?.(error, requestCtx.stopErrorPropagation)
      }

      return [mappedData, error] as const
    }))
  }
}

export interface QueryClientContext<P extends unknown[] = unknown[], R = unknown> extends ClientContext<R> {
  $key: ReadableSignal<CacheKey<P, R>>
  Q: true
}

export interface MutationClientContext<T = unknown> extends ClientContext<T> {
  $key: never
  M: true
}

/* @__NO_SIDE_EFFECTS__ */
export function forkClient<C extends QueryClientContext | MutationClientContext>(
  ctx: ClientContext,
  settings: ClientSetting<C>[] = [],
  $key?: ReadableSignal<CacheKey>
) {
  const child = Object.create(ctx) as ClientContext

  // A query has a key, a mutation has none
  child.$key = $key

  for (const setting of settings) {
    setting(child as C)
  }

  return child as C
}

/**
 * Set dedupe time in which identical requests are deduped.
 * @param time - Dedupe time in milliseconds.
 * @returns The client setting function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function dedupeTime(time: number): ClientSetting<QueryClientContext> {
  return ctx => ctx.dedupeTime = time
}

/**
 * Set cache time for cached query results.
 * @param time - Cache time in milliseconds.
 * @returns The client setting function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function cacheTime(time: number): ClientSetting<QueryClientContext> {
  return ctx => ctx.cacheTime = time
}

/**
 * Map error object to string.
 * @param fn - Function to map error to string.
 * @returns The client setting function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function mapError(fn: (error: unknown) => string): ClientSetting {
  return ctx => ctx.mapError = fn
}

/**
 * Register a callback to be called on every error.
 * @param fn - The error callback.
 * @returns The client setting function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function onEveryError(fn: OnEveryError): ClientSetting {
  return ctx => ctx.onEveryError = addFn(ctx.onEveryError, fn)
}

/**
 * Disable requests when the signal is true.
 * @param $disabled - Readable signal indicating whether requests are disabled.
 * @returns The client setting function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function disabled($disabled: Accessor<boolean>): ClientSetting {
  return ctx => ctx.$disabled = $disabled
}

/**
 * Enable or disable deduplication of requests (by loading state and dedupe time).
 * @param enabled - Whether deduplication is enabled.
 * @returns The client setting function.
 */
export function dedupe(dedupe: boolean): ClientSetting

/**
 * Enable or disable deduplication of requests (by loading state and dedupe time).
 * @param loading - Whether loading state deduplication is enabled.
 * @param time - Whether time-based deduplication is enabled.
 * @returns The client setting function.
 */
export function dedupe(loading: boolean, time: boolean): ClientSetting<QueryClientContext>

/* @__NO_SIDE_EFFECTS__ */
export function dedupe(loading: boolean, time = loading): ClientSetting {
  return (ctx) => {
    ctx.loadingDedupe = loading
    ctx.timeDedupe = time
  }
}
