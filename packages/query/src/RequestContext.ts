import type { CacheKey } from './CacheStorage.types.js'
import { addFn } from './utils.js'

export type OnSuccess<T> = (data: T) => void

export type OnError = (error: unknown) => void

export type OnSettled<T> = (data: T | undefined, error: unknown) => void

export class RequestContext<T> {
  onSuccess: OnSuccess<T> | undefined = undefined
  onError: OnError | undefined = undefined
  onSettled: OnSettled<T> | undefined = undefined
  stopErrorPropagation = false
  prevCtx: RequestContext<T> | undefined = undefined

  constructor(prevCtx?: RequestContext<T>) {
    if (this.prevCtx = prevCtx) {
      prevCtx.prevCtx = undefined
    }
  }

  settled(data: T | undefined, error: unknown) {
    this.onSettled?.(data, error)

    if (error !== undefined) {
      this.onError?.(error)
    } else {
      this.onSuccess?.(data!)
    }
  }
}

export class QueryContext<P extends unknown[], R>
  extends RequestContext<R>
  implements CacheKey<P, R> {
  shard: string
  key: string
  params: P
  R!: R

  constructor(
    key: CacheKey<P, R>,
    prevCtx?: QueryContext<P, R>
  ) {
    super(prevCtx)

    this.shard = key.shard
    this.key = key.key
    this.params = key.params
  }
}

/**
 * Add a success callback to the query context.
 * @param ctx - The query context.
 * @param fn - The success callback.
 */
export function onSuccess<T>(ctx: RequestContext<T>, fn: OnSuccess<T>) {
  ctx.onSuccess = addFn(ctx.onSuccess, fn)
}

/**
 * Add an error callback to the query context.
 * @param ctx - The query context.
 * @param fn - The error callback.
 */
export function onError<T>(ctx: RequestContext<T>, fn: OnError) {
  ctx.onError = addFn(ctx.onError, fn)
}

/**
 * Add a settled callback to the query context.
 * @param ctx - The query context.
 * @param fn - The settled callback.
 */
export function onSettled<T>(ctx: RequestContext<T>, fn: OnSettled<T>) {
  ctx.onSettled = addFn(ctx.onSettled, fn)
}

/**
 * Mark error as "stopped", so error will be passed to onEveryError with stopped=true.
 * @param ctx - The query context.
 */
export function stopErrorPropagation<T>(ctx: RequestContext<T>) {
  ctx.stopErrorPropagation = true
}
