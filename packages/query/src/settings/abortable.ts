import type { ClientSetting } from '../client.types.js'
import type { ClientContext } from '../ClientContext.js'
import type { RequestContext } from '../RequestContext.js'

interface AbortableContext extends ClientContext {
  abortable?: boolean
}

// oxlint-disable-next-line typescript/no-explicit-any
const abortControllers = new WeakMap<RequestContext<any> | Promise<any>, AbortController>()

/**
 * Returns the AbortSignal for the given RequestContext
 * @param ctx - RequestContext
 * @returns AbortSignal
 */
/* @__NO_SIDE_EFFECTS__ */
export function abortSignal<T>(ctx: RequestContext<T>) {
  let controller = abortControllers.get(ctx)

  if (!controller) {
    abortControllers.set(ctx, controller = new AbortController())
  }

  return controller.signal
}

/**
 * Aborts request associated with the given Promise or RequestContext
 * @param promiseOrCtx - Promise or RequestContext
 */
export function abort<T>(promiseOrCtx: Promise<T> | RequestContext<T>) {
  abortControllers.get(promiseOrCtx)?.abort()
}

/**
 * Aborts previous request associated with the given RequestContext
 * @param ctx - RequestContext
 */
export function abortPrevious<T>(ctx: RequestContext<T>) {
  abort(ctx.prevCtx!)
}

/**
 * Make requests abortable.
 * @returns The client setting function.
 */
/* @__NO_SIDE_EFFECTS__ */
export function abortable(): ClientSetting {
  return (ctx: AbortableContext) => {
    if (ctx.abortable === undefined) {
      const superRun = ctx.run

      ctx.run = function (
        this: ClientContext,
        requestCtx: RequestContext<unknown>,
        start,
        onSettled: (data: unknown, error: string | null) => void,
        interrupt
      ) {
        let abortController: AbortController | undefined
        const promise = superRun.call(
          this,
          requestCtx,
          start,
          onSettled,
          error => interrupt?.(error) || abortController?.signal.aborted === true
        )

        if (abortController = abortControllers.get(requestCtx)) {
          abortControllers.set(promise, abortController)
          void promise.finally(() => abortControllers.delete(promise))
        }

        return promise
      } as typeof superRun
    }

    ctx.abortable = true
  }
}
