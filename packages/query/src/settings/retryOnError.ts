import type { ClientSetting } from '../client.types.js'
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
              this.retryCounts?.delete(queryCtx.key)
            } else {
              const retryCounts = this.retryCounts ??= new Map<string, number>()
              const retryCount = (retryCounts.get(queryCtx.key) || 0) + 1

              this.retryTimeoutId = setTimeout(() => {
                // Asked again over what it shows, as the loaded pages of an infinite query
                this.revalidate(queryCtx)
                retryCounts.set(queryCtx.key, retryCount)
              }, this.calcRetryDelay!(retryCount, error))
            }
          }
        ))

        return promise
      }
    }

    ctx.calcRetryDelay = calcRetryDelay
  }
}
