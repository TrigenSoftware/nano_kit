import type {
  Hono,
  MiddlewareHandler
} from 'hono'

/**
 * The app a virtual fetch answers by: a Hono app, for routes to be put on.
 */
export type App = Hono

/**
 * A function that puts routes on the app of a virtual fetch, as a module of a mock does.
 * It gets the app first, then the arguments the fetch was made with, such as the database
 * to answer from.
 */
export type Routes<A extends unknown[] = []> = (app: App, ...args: A) => void

/**
 * A behavior: a handler of a route, as `pending()`, `fail()` and the other behaviors make
 * it, for a helper that takes one.
 * @example
 * function refusing(path: string, behavior: Behavior = fail()) {
 *   return (app: App) => {
 *     app.delete(path, behavior)
 *   }
 * }
 */
export type Behavior = MiddlewareHandler
