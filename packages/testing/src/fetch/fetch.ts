import { Hono } from 'hono'
import type { FalsyValue } from '../types.js'
import { compact } from '../utils.js'
import type { Routes } from './fetch.types.js'
import { offlineSignal } from './behaviors.js'
import { NOT_FOUND_STATUS } from './constants.js'

/* What a relative address is taken against: routes match by path, so any origin would do */
const origin = 'http://localhost/'

function build<A extends unknown[]>(handlers: readonly (Routes<A> | FalsyValue)[], args: A): Hono {
  const app = new Hono()

  app.notFound((c) => {
    console.warn(`virtualFetch: no route answers ${c.req.method} ${c.req.path}`)

    return c.text('404 Not Found', NOT_FOUND_STATUS)
  })
  compact(handlers)
    // Every handler on an app of its own and in order, so what they do to the arguments, such
    // as the database, is done in order too
    .map((handler) => {
      const layer = new Hono()

      handler(layer, ...args)

      return layer
    })
    // Hono tries routes in the order they were put on, so the last layer goes first and lies
    // on top of the earlier ones
    .toReversed()
    .forEach(layer => app.route('/', layer))

  return app
}

/* The answer of the app, or the reason of the abort as soon as the request is aborted */
async function answer(app: Hono, request: Request): Promise<Response> {
  const { signal } = request
  const { promise, reject } = Promise.withResolvers<never>()
  const abort = () => reject(signal.reason)

  signal.addEventListener('abort', abort)

  try {
    return await Promise.race([app.fetch(request), promise])
  } catch (error) {
    // A request with no answer at all: a real fetch rejects it with a `TypeError`
    throw error === offlineSignal
      ? new TypeError('Failed to fetch')
      : error
  } finally {
    signal.removeEventListener('abort', abort)
  }
}

/**
 * Creates a fetch that answers by the routes of a Hono app instead of the network: to stand
 * in for a backend in stories, tests and demos.
 *
 * It behaves as the real one: it always returns a promise, rejects with the reason of an
 * aborted signal, even while a route is still answering, fills `response.url` and takes
 * relative addresses. A request that no route answers gets a 404 and a warning in the console.
 * @param handlers - Functions that put routes on the app. They run once, on the first request,
 * in order, and a later function lies on top of the earlier ones: its routes answer first and
 * its middleware wraps their routes. A falsy item is skipped, so a condition fits right in the
 * list.
 * @param args - What the handlers get after the app, such as the database to answer from.
 * @returns The fetch.
 * @example
 * const fetch = virtualFetch([gardenMock.routes, plantMock.routes], db)
 *
 * const response = await fetch('garden/1/plants')
 */
/* @__NO_SIDE_EFFECTS__ */
export function virtualFetch<A extends unknown[]>(
  handlers: NoInfer<readonly (Routes<A> | FalsyValue)[]>,
  ...args: A
): typeof fetch {
  let app: Hono | undefined

  return async (input, init) => {
    const request = new Request(typeof input === 'string' ? new URL(input, origin) : input, init)

    request.signal.throwIfAborted()
    app ??= build(handlers, args)

    const response = await answer(app, request)

    // A response of a real fetch knows where it came from
    Object.defineProperty(response, 'url', {
      value: request.url
    })

    return response
  }
}
