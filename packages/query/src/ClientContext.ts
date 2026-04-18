import {
  type ReadableSignal,
  type Accessor,
  type TasksRunner,
  type Task,
  TasksRunner$,
  taskPromise,
  inject
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
  $key?: ReadableSignal<CacheKey> = undefined
  $disabled?: Accessor<boolean> = undefined
  loadingDedupe = true
  timeDedupe = true
  onEveryError: OnEveryError | undefined = undefined

  task<T>(task: Task<T>): Promise<T> {
    return taskPromise(task)
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
      this.$disabled?.() === true
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

    return this.task(settle(start(), (data, error) => {
      if (error && interrupt?.(error)) {
        return
      }

      const dataOrNull = error ? null : mapData(data as T)
      const errorString = error ? mapError(error) : null

      onSettled(dataOrNull, errorString)
      requestCtx.settled(data, error)
      this.handleError(error, requestCtx.stopErrorPropagation)

      return [data, error] as const
    }))
  }

  handleError(
    error: unknown,
    stopped: boolean
  ) {
    if (error !== undefined) {
      this.onEveryError?.(error, stopped)
    }
  }
}

export interface QueryClientContext<T = unknown> extends ClientContext<T> {
  $key: ReadableSignal<CacheKey>
  Q: true
}

export interface MutationClientContext<T = unknown> extends ClientContext<T> {
  $key: never
  M: true
}

/* @__NO_SIDE_EFFECTS__ */
export function forkMutationClient<T>(
  ctx: ClientContext,
  settings: ClientSetting<MutationClientContext<T>>[] = []
) {
  const child = Object.create(ctx) as MutationClientContext<T>

  for (const setting of settings) {
    setting(child)
  }

  return child
}

/* @__NO_SIDE_EFFECTS__ */
export function forkQueryClient<T>(
  ctx: ClientContext,
  $key: ReadableSignal<CacheKey>,
  settings: ClientSetting<QueryClientContext<T>>[] = []
) {
  const child = Object.create(ctx) as QueryClientContext<T>

  child.$key = $key

  for (const setting of settings) {
    setting(child)
  }

  return child
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

/**
 * Set task runner for handling tasks.
 * Without arguments, it will try to inject tasks runner from context.
 * @param runner - The tasks runner function.
 * @returns The client setting function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function tasks(runner: TasksRunner = inject(TasksRunner$)): ClientSetting {
  return ctx => ctx.task = runner
}
