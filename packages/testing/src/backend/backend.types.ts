import type {
  Schema,
  VirtualDatabase
} from '../database.types.js'
import type { Routes } from '../fetch/fetch.types.js'
import type { FalsyValue } from '../types.js'

/**
 * A function that tunes a fork of a virtual backend: it changes the data, as a recipe of a
 * database does, and puts routes that answer before the ones of the modules and of the
 * recipes before it.
 */
export type BackendRecipe<S extends Schema> = Routes<[db: VirtualDatabase<S>]>

/**
 * Makes an independent copy of a virtual backend as it is now and applies the recipes to it.
 * The routes are put on anew, so counters, such as the ones of `sequence()`, start from zero.
 * The copy and the backend do not see each other's changes from then on.
 *
 * Every recipe lies on top of the ones before it: it writes its data later, and its routes
 * answer before the ones of the earlier recipes and of the modules.
 * @param recipes - Functions that tune the copy, applied in order. A falsy one is skipped, so a
 * condition fits right in the list.
 * @returns The fetch and the database of the copy.
 * @example
 * const [fetch, db] = fork((app, db) => {
 *   db.session = 'user-1'
 *   app.delete('/garden/1/plants/1', fail())
 * })
 *
 * fork(signedIn, isEmpty && emptyGarden)
 */
export type BackendFork<S extends Schema> = (
  ...recipes: (BackendRecipe<S> | FalsyValue)[]
) => readonly [fetch: typeof fetch, db: VirtualDatabase<S>]

/**
 * The type of a recipe of a virtual backend, taken from its `fork`: for a recipe written apart
 * from a call of `fork()`, whose parameters nothing else types.
 * @example
 * export const [fetch, db, fork] = virtualBackend([gardenMock, userMock])
 * export type Recipe = RecipeOf<typeof fork>
 *
 * const emptyGarden: Recipe = (_, db) => {
 *   db.plants.delete({ gardenId: '1' })
 * }
 */
export type RecipeOf<F> = F extends BackendFork<infer S> ? BackendRecipe<S> : never

/**
 * A virtual backend: a fetch, the database it answers from and a function that forks both.
 */
export type VirtualBackend<S extends Schema> = readonly [
  fetch: typeof fetch,
  db: VirtualDatabase<S>,
  fork: BackendFork<S>
]
