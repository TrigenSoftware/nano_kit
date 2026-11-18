/**
 * What a collection finds a record by.
 */
export type Id = string | number

/**
 * A record of a collection: any object with an `id`.
 */
export interface Row {
  id: Id
}

/**
 * Shows an intersection as one object, so an editor lists the fields rather than the formula.
 */
export type Simplify<T> = {
  [K in keyof T]: T[K]
} & {}

/**
 * What a record is made of: every field of it, the `id` optional.
 */
export type Input<T extends Row> = Simplify<Omit<T, 'id'> & {
  id?: T['id']
}>

/**
 * What a record is made of in a collection with an entity: any of its fields, as the entity
 * gives them all.
 */
export type PartialInput<T extends Row> = Simplify<Partial<Input<T>>>

/**
 * What picks records of a collection: an id, the fields a record should have, or a predicate.
 */
export type Select<T extends Row> = T['id'] | Partial<T> | ((row: Readonly<T>) => unknown)

/**
 * Changes to a record: fields to merge into it, or a function that edits its draft in place
 * and may return fields to merge too.
 */
export type Patch<T extends Row> = Partial<T> | ((draft: T) => Partial<T> | void)

/**
 * The parameters of a collection.
 */
export interface CollectionOptions<T extends Row> {
  /**
   * Makes the id of a record created without one, from the number of the record: 1, 2 and
   * so on. Every created record takes the next number, one created with its own id too.
   *
   * By default ids are the strings `'1'`, `'2'` and so on, so a collection with ids of
   * another type has to be given this.
   * @example
   * collection<Post>({ id: seq => seq })
   * collection<Token>({ id: () => crypto.randomUUID() })
   */
  id?: (seq: number) => T['id']
  /**
   * Makes every field of a new record, from the number of the record: 1, 2 and so on.
   * Called anew for every record.
   *
   * The entity gives every field, so `create()` needs none: the fields it is told override
   * them.
   * @example
   * collection<Garden>({ entity: seq => ({ name: `Garden ${seq}` }) })
   */
  entity?: (seq: number) => Input<T>
  /**
   * The records the collection holds at first, taken as they are. New records are numbered
   * after them.
   */
  initial?: readonly T[]
}
