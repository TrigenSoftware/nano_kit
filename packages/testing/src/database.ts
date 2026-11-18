import type {
  Recipe,
  Schema,
  VirtualDatabase
} from './database.types.js'
import type {
  FalsyValue,
  State
} from './types.js'
import { compact } from './utils.js'
import { Value } from './value.js'

/* The names a database has of its own, so a schema cannot take them */
interface Reserved {
  fork?: never
  reset?: never
}

type Parts = Record<string, State<unknown>>

function forkAll(parts: Parts): Parts {
  return Object.fromEntries(Object.entries(parts).map(([key, part]) => [key, part.fork()]))
}

/**
 * The methods every virtual database has, whatever its schema. A database also has the
 * collections and values of its schema as properties: see {@link VirtualDatabase}.
 */
export class Database<S extends Schema> {
  readonly #source: Parts
  // Without the schema in its type, so that a database fits where one of a part of its
  // schema is expected
  readonly #recipes: ((db: never) => void)[]
  #parts: Parts | undefined

  constructor(source: Parts, recipes: Recipe<S>[]) {
    this.#source = source
    this.#recipes = recipes

    for (const key of Object.keys(source)) {
      const isValue = source[key] instanceof Value

      Object.defineProperty(this, key, {
        enumerable: true,
        get: (): unknown => {
          const part = this.#open()[key]

          // A value is the data itself, a collection is the way to its records
          return isValue ? part.get() : part
        },
        // A collection changes through its methods, so only a value takes a new one
        set: isValue
          ? (next: unknown) => {
            this.#open()[key].set(next)
          }
          : undefined
      })
    }
  }

  /**
   * Makes an independent copy of the database as it is now and applies the recipes to it.
   * The copy and the database do not see each other's changes from then on.
   * @param recipes - Functions that tune the copy, applied in order. A falsy one is skipped, so
   * a condition fits right in the list.
   * @returns The copy.
   * @example
   * const signedIn = (db: DB) => {
   *   db.session = 'user-1'
   * }
   * const emptyGarden = (db: DB) => {
   *   db.plants.delete({ gardenId: '1' })
   * }
   *
   * const state = db.fork(signedIn, isEmpty && emptyGarden)
   */
  fork(...recipes: (Recipe<S> | FalsyValue)[]): VirtualDatabase<S> {
    const fork = new Database<S>(this.#open(), compact(recipes))

    // A fork is the parent at the moment of the fork, so it does not wait for its first use
    fork.#open()

    return fork as VirtualDatabase<S>
  }

  /**
   * Returns the database to what it was right after it was made: after its seed, or after
   * the recipes of the fork.
   * @returns The database.
   */
  reset(): this {
    Object.values(this.#open()).forEach(part => part.reset())

    return this
  }

  /* Copies the parts and runs the recipes on the first use */
  #open(): Parts {
    if (!this.#parts) {
      // Copies: a database shares its data with nothing, the parts it is made of included
      this.#parts = forkAll(this.#source)

      try {
        // The whole database: the constructor has defined its collections and values
        this.#recipes.forEach(recipe => recipe(this as never))
      } catch (error) {
        // Half a seed is no database: the next use starts over, and fails the same way
        this.#parts = undefined
        throw error
      }

      // Copies of what the recipes made, so that reset() comes back to it
      this.#parts = forkAll(this.#parts)
    }

    return this.#parts
  }
}

/**
 * Creates a virtual database: typed collections and single values in memory, to stand in
 * for a backend's data in stories, tests and demos.
 *
 * Records and values are read-only: a record changes through the methods of its collection,
 * and a value by assigning a new one. So a `fork()` of the database is an independent state
 * to tune, and `reset()` brings a database back to its start.
 * @param schema - The collections and values of the database, by their names. The database
 * takes copies of them, so it shares no data with them, and one schema makes any number of
 * databases.
 * @param seed - Fills the database: creates records and ties records of different
 * collections together. Runs once, on the first use of the database.
 * @returns The database.
 * @example
 * const db = virtualDatabase({
 *   gardens: collection<Garden>(),
 *   plants: collection<Plant>({ entity: createPlant }),
 *   session: value<string | null>(null)
 * }, (db) => {
 *   const garden = db.gardens.create({ name: 'Courtyard garden' })
 *
 *   db.plants.createMany(10, { gardenId: garden.id })
 * })
 *
 * db.plants.where({ gardenId: '1' })
 * db.session = 'user-1'
 */
/* @__NO_SIDE_EFFECTS__ */
export function virtualDatabase<S extends Schema>(schema: S & Reserved, seed?: Recipe<S>): VirtualDatabase<S> {
  return new Database<S>(schema, seed ? [seed] : []) as VirtualDatabase<S>
}
