import { Hono } from 'hono'
import type {
  Recipe,
  Schema,
  VirtualDatabase
} from '../database.types.js'
import type {
  App,
  Routes
} from '../fetch/fetch.types.js'
import { virtualDatabase } from '../database.js'
import { virtualFetch } from '../fetch/fetch.js'
import { compact } from '../utils.js'
import type {
  BackendFork,
  VirtualBackend
} from './backend.types.js'

/* A module of any schema: what the list of modules is inferred from */
interface AnyModule {
  schema?: Schema
  seed?: (db: never) => void
  routes?: (app: App, db: never) => void
}

/* A module that works with the database of all the schemas. Fields rather than methods,
   so that a module that needs a collection missing from the list does not fit */
interface Fitting<S extends Schema> {
  schema?: Schema
  seed?: Recipe<S>
  routes?: Routes<[db: VirtualDatabase<S>]>
}

type Intersection<U> = (U extends unknown ? (union: U) => void : never) extends (intersection: infer I) => void
  ? I
  : never

type SchemaOf<M> = M extends { schema: infer S extends Schema } ? S : never

/* The schemas of all the modules as one */
type MergedSchema<M extends readonly AnyModule[]> = Intersection<SchemaOf<M[number]>> extends infer S extends Schema
  ? S
  : Record<never, never>

/**
 * Creates a virtual backend from the modules of a mock: a database of all their schemas,
 * filled by their seeds, and a fetch that answers by all their routes. A module is what a mock
 * module exports: `schema`, `seed(db)` and `routes(app, db)`, each of them optional.
 *
 * Make the backend once and fork it with its `fork` for every story and test: a fork shares
 * no data with the backend or with other forks, and its recipes can put routes in front of
 * the modules'.
 * @param modules - The modules of the mock. Their seeds run in this order, and a later module
 * lies on top of the earlier ones: its routes answer first.
 * @param seed - Runs after the seeds of the modules: for data that belongs to no module.
 * @returns The fetch, the database and `fork`, which makes independent copies of both.
 * @example
 * // app/services/user/user.mock.ts
 * export function signedIn(_: App, db: DB) {
 *   db.session = 'user-1'
 * }
 *
 * // app/services/api/api.mock.ts
 * export const [fetch, db, fork] = virtualBackend([gardenMock, plantMock, userMock])
 *
 * // A story
 * const [fetch] = fork(signedIn, (app) => {
 *   app.delete('/garden/1/plants/1', fail())
 * })
 */
/* @__NO_SIDE_EFFECTS__ */
export function virtualBackend<const M extends readonly AnyModule[]>(
  modules: M & NoInfer<{ readonly [K in keyof M]: Fitting<MergedSchema<M>> }>,
  seed?: Recipe<MergedSchema<M>>
): VirtualBackend<MergedSchema<M>> {
  const fitting: readonly Fitting<MergedSchema<M>>[] = modules
  const routes = fitting.flatMap(module => module.routes ?? [])
  const db = virtualDatabase(
    Object.assign({}, ...modules.map(module => module.schema)) as MergedSchema<M>,
    (db) => {
      fitting.forEach(module => module.seed?.(db))
      seed?.(db)
    }
  )
  const fork: BackendFork<MergedSchema<M>> = (...args) => {
    const recipes = compact(args)
    const layers = recipes.map(() => new Hono())
    const copy = db.fork(db => recipes.forEach((recipe, index) => recipe(layers[index], db)))
    // After the modules, so the recipes lie on top of them, and every recipe on top of the
    // ones before it
    const handlers = [...routes, ...layers.map(layer => (app: App) => app.route('/', layer))]

    return [virtualFetch(handlers, copy), copy]
  }

  return [virtualFetch(routes, db), db, fork]
}
