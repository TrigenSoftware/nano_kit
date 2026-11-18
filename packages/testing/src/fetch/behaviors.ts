import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { Behavior } from './fetch.types.js'

/* What `offline()` rejects with. Hono hands on what is not an `Error`, so it reaches the
   fetch, which rejects with a network error in its place */
export const offlineSignal = /* @__PURE__ */ Symbol('offline')

/**
 * Creates a handler that never answers, as a request that hangs: to show a loading state.
 * The request can still be aborted.
 * @returns The handler.
 * @example
 * app.get('/garden/1/plants', pending())
 */
/* @__NO_SIDE_EFFECTS__ */
export function pending(): Behavior {
  return () => new Promise<never>(() => { /* never settles */ })
}

/**
 * Creates a handler that answers with a failure.
 * @param status - The status of the answer.
 * @param body - What to answer with, as JSON. Without it, the answer has no body.
 * @returns The handler.
 * @example
 * app.delete('/garden/1/plants/1', fail())
 * app.post('/users', fail(409, { error: 'User already exists' }))
 */
/* @__NO_SIDE_EFFECTS__ */
export function fail(status: ContentfulStatusCode = 500, body?: unknown): Behavior {
  return c => Promise.resolve(body === undefined
    ? c.body(null, status)
    : c.json(body as object, status))
}

/**
 * Creates a handler that cuts the network off: the fetch rejects with a `TypeError`, as the
 * real one does when there is no connection.
 * @returns The handler.
 * @example
 * app.use(offline())
 */
/* @__NO_SIDE_EFFECTS__ */
export function offline(): Behavior {
  // oxlint-disable-next-line prefer-promise-reject-errors
  return () => Promise.reject(offlineSignal)
}

/**
 * Creates a handler that holds a request for a while, then hands it on to the routes below.
 * @param ms - How long to hold the request, in milliseconds.
 * @returns The handler.
 * @example
 * app.use(delay(500))
 */
/* @__NO_SIDE_EFFECTS__ */
export function delay(ms: number): Behavior {
  return async (_, next) => {
    await new Promise(resolve => setTimeout(resolve, ms))
    await next()
  }
}

/**
 * Creates a handler that rewrites the JSON the routes below answer with. An answer that is
 * not JSON, such as the 404 of a missing record, goes as it is.
 * @param map - Takes the data of the answer and returns the new data.
 * @returns The handler.
 * @example
 * app.get('/garden/1/plants', mapJson(page => ({ ...page, isLastPage: true })))
 */
/* @__NO_SIDE_EFFECTS__ */
export function mapJson(
  // `any`, as `response.json()` gives: the handler knows the shape of its own answers
  // oxlint-disable-next-line typescript/no-explicit-any
  map: (data: any) => unknown
): Behavior {
  return async (c, next) => {
    await next()

    if (c.res.headers.get('content-type')?.startsWith('application/json')) {
      c.res = c.json(map(await c.res.json()) as object, c.res.status as ContentfulStatusCode)
    }
  }
}

/**
 * Creates a handler that hands a request on to the routes below: a step of `sequence()`
 * that changes nothing.
 * @returns The handler.
 * @example
 * app.get('/garden/1/plants', sequence(pass(), fail()))
 */
/* @__NO_SIDE_EFFECTS__ */
export function pass(): Behavior {
  return (_, next) => next()
}

/**
 * Creates a handler that gives the n-th request the n-th step and hands the requests after
 * the steps on to the routes below. Requests are counted for every path apart, whatever
 * their query.
 * @param steps - Handlers for the first requests, in order.
 * @returns The handler.
 * @example
 * // The first load fails, the retry gets the plants
 * app.get('/garden/1/plants', sequence(fail()))
 */
/* @__NO_SIDE_EFFECTS__ */
export function sequence(...steps: Behavior[]): Behavior {
  const counts = new Map<string, number>()

  return (c, next) => {
    const count = counts.get(c.req.path) ?? 0

    counts.set(c.req.path, count + 1)

    return count < steps.length
      ? steps[count](c, next)
      : next()
  }
}

/**
 * Creates a handler that applies a behavior to the requests that pass a test and hands the
 * others on to the routes below.
 * @param test - Tells whether a request gets the behavior.
 * @param behavior - The handler for the requests that pass.
 * @returns The handler.
 * @example
 * app.use(when(c => c.req.method === 'DELETE', fail()))
 */
/* @__NO_SIDE_EFFECTS__ */
export function when(test: (c: Context) => boolean, behavior: Behavior): Behavior {
  return (c, next) => (test(c)
    ? behavior(c, next)
    : next())
}
