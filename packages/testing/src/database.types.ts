import type { Collection } from './collection.js'
import type { Database } from './database.js'
import type { Frozen } from './types.js'
import type { Value } from './value.js'

/* A collection of any records: one of `unknown` records would not take a typed one */
// oxlint-disable-next-line typescript/no-explicit-any
type AnyCollection = Collection<any, any>

/**
 * What a virtual database is made of: collections and single values by their names.
 */
// oxlint-disable-next-line typescript/no-explicit-any
export type Schema = Record<string, AnyCollection | Value<any>>

/**
 * A function that brings a database to a state: it seeds one, or tunes a fork of one.
 */
export type Recipe<S extends Schema> = (db: VirtualDatabase<S>) => void

/**
 * A virtual database: the collections and values of its schema, by their names, and the
 * methods of a {@link Database}. A value is read and assigned as a property of the
 * database: `db.session = 'user-1'`.
 */
export type VirtualDatabase<S extends Schema> = Database<S> & {
  readonly [K in keyof S as S[K] extends AnyCollection ? K : never]: S[K]
} & {
  [K in keyof S as S[K] extends AnyCollection ? never : K]: S[K] extends Value<infer T>
    ? Frozen<T>
    : never
}
