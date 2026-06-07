import type { ClientSetting } from '../client.types.js'
import type { CacheKey } from '../CacheStorage.types.js'
import type { QueryClientContext } from '../ClientContext.js'
import type { QueryContext } from '../RequestContext.js'

export type CalcRetryDelay = (retryCount: number, error: unknown) => number

interface RetryContext extends QueryClientContext {
  retryCounts?: Map<string, number>
  retryTimeoutId?: ReturnType<typeof setTimeout>
  calcRetryDelay?: CalcRetryDelay
}

/* @__NO_SIDE_EFFECTS__ */
export function defaultCalcRetryDelay(retryCount: number) {
  return (
    // oxlint-disable-next-line eslint/no-magic-numbers
    ~~((Math.random() + 0.5) * (1 << (retryCount < 8 ? retryCount : 8))) * 2000
  )
}

function getRetryCount(ctx: RetryContext, key: CacheKey) {
  return ctx.retryCounts?.get(key.key) || 0
}

function setRetryCount(ctx: RetryContext, key: CacheKey, count: number) {
  (ctx.retryCounts ??= new Map()).set(key.key, count)
}

function clearRetryCount(ctx: RetryContext, key: CacheKey) {
  ctx.retryCounts?.delete(key.key)
}

/**
 * Retry the query on error with exponential backoff.
 * @param calcRetryDelay - Function to calculate the delay before retrying.
 * @returns The client setting function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function retryOnError(
  calcRetryDelay: CalcRetryDelay = defaultCalcRetryDelay
): ClientSetting<QueryClientContext> {
  return (ctx: RetryContext) => {
    if (ctx.calcRetryDelay === undefined) {
      const superRun = ctx.run

      ctx.run = function (
        this: RetryContext,
        queryCtx: QueryContext<unknown[], unknown>,
        start,
        onSettled: (data: unknown, error: string | null) => void,
        interrupt
      ) {
        clearTimeout(this.retryTimeoutId)

        const promise = superRun.call(this, queryCtx, start, onSettled, interrupt)

        if (!('shard' in queryCtx)) {
          return promise
        }

        void this.task(promise.then(
          (result) => {
            const error = result?.[1]

            if (!error) {
              clearRetryCount(this, queryCtx)
            } else {
              const retryCount = getRetryCount(this, queryCtx) + 1
              const delay = this.calcRetryDelay!(retryCount, error)

              this.retryTimeoutId = setTimeout(() => {
                this.invalidate(queryCtx)
                setRetryCount(this, queryCtx, retryCount)
              }, delay)
            }
          }
        ))

        return promise
      } as typeof superRun
    }

    ctx.calcRetryDelay = calcRetryDelay
  }
}
