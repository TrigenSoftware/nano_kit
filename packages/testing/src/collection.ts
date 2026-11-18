import type {
  CollectionOptions,
  Input,
  PartialInput,
  Patch,
  Row,
  Select
} from './collection.types.js'
import type {
  Frozen,
  State
} from './types.js'
import {
  draft,
  frozen,
  isId,
  matcher
} from './utils.js'

/* The records of a collection at a moment, and the number its last record took */
interface Slice<T> {
  readonly rows: readonly T[]
  readonly seq: number
}

/* Ids that are not plain strings cannot be made by default: `id` is required then */
type WithId<T extends Row, O extends { id?: unknown }> = string extends T['id']
  ? O
  : O & Required<Pick<O, 'id'>>

/* The parameters of a collection without an entity */
type PlainOptions<T extends Row> = WithId<T, Omit<CollectionOptions<T>, 'entity'> & {
  entity?: undefined
}>

/* The fields are optional once none of them is required: the entity gives them all */
type CreateArgs<I> = Partial<I> extends I ? [fields?: I] : [fields: I]

type CreateManyArgs<I> = Partial<I> extends I
  ? [fields?: I | ((index: number) => I)]
  : [fields: I | ((index: number) => I)]

/* An id names a record, so a missing one is a mistake: fields and a predicate only filter */
function assertPicked<T extends Row>(action: string, select: Select<T>, picked: readonly T[]): void {
  if (!picked.length && isId(select)) {
    throw new Error(`Cannot ${action}: no record has the id ${JSON.stringify(select)}`)
  }
}

function patched<T extends Row>(row: T, patch: Patch<T>): T {
  const copy = draft(row)
  const changes = typeof patch === 'function' ? patch(copy) : patch

  return frozen({
    ...copy,
    ...changes,
    id: row.id
  })
}

/**
 * A collection: records found by their `id`.
 *
 * Records are read-only. What `get()`, `find()` and `where()` return is a snapshot: to change
 * the collection, call `create()`, `update()`, `delete()`, `set()` or `reset()`.
 */
export class Collection<T extends Row, I = Input<T>> implements State<T[]> {
  readonly #options: CollectionOptions<T>
  #state: Slice<T>
  #initial: Slice<T>

  constructor(options: CollectionOptions<T> = {}) {
    const rows = Object.freeze((options.initial ?? []).map(row => frozen(row)))

    this.#options = options
    this.#state = {
      rows,
      seq: rows.length
    }
    this.#initial = this.#state
  }

  /**
   * Gets every record, in the order they were created.
   * @returns A read-only array of the records.
   */
  get(): Frozen<T[]> {
    return this.#state.rows
  }

  /**
   * Finds the first record a selector picks.
   * @param select - An id, the fields the record should have, or a predicate.
   * @returns The record, or `undefined` when there is none.
   * @example
   * db.plants.find('1')
   * db.plants.find({ id: '1', gardenId: '2' })
   * db.plants.find(plant => plant.name.startsWith('Fern'))
   */
  find(select: Select<T>): Readonly<T> | undefined {
    return this.#state.rows.find(matcher(select))
  }

  /**
   * Finds every record a selector picks.
   * @param select - An id, the fields the records should have, or a predicate.
   * @returns A read-only array of the records.
   * @example
   * db.plants.where({ gardenId: '1' })
   */
  where(select: Select<T>): Frozen<T[]> {
    return Object.freeze(this.#state.rows.filter(matcher(select)))
  }

  /**
   * Creates a record. Without an `id` it gets the next one of the collection; the fields not
   * given come from the collection's entity.
   * @param args
   * @returns The record.
   * @throws {Error} When the collection already has a record with the given `id`.
   * @example
   * db.plants.create({ gardenId: '1', name: 'Boston fern' })
   */
  create(...args: CreateArgs<I>): Readonly<T>
  create(fields?: I): Readonly<T> {
    const {
      id: makeId = String as (seq: number) => T['id'],
      entity
    } = this.#options
    const { rows, seq: last } = this.#state
    // Every record takes the next number, so the entity and the id are made of the same one
    const input = {
      ...entity?.(last + 1),
      ...fields
    } as Input<T>
    let seq = last
    let { id } = input

    if (id === undefined) {
      // An id may be taken by a record created with it: the next free one, then. Not for
      // longer than there are records, in case the ids are made without regard to `seq`
      for (let tries = rows.length; ; tries--) {
        const next = makeId(++seq)

        if (!rows.some(row => row.id === next)) {
          id = next
          break
        }

        if (!tries) {
          throw new Error(`Cannot make a new id: ${JSON.stringify(next)} is made again`)
        }
      }
    } else if (rows.some(row => row.id === id)) {
      throw new Error(`A record with the id ${JSON.stringify(id)} already exists`)
    } else {
      seq++
    }

    const row = frozen({
      ...input,
      id
    } as T)

    this.#state = {
      rows: Object.freeze([...rows, row]),
      seq
    }

    return row
  }

  /**
   * Creates several records, as `create()` does each.
   * @param inputs - The fields of every record.
   * @returns The records.
   * @example
   * db.plants.createMany([{ gardenId: '1' }, { gardenId: '2' }])
   */
  createMany(inputs: readonly I[]): Frozen<T[]>
  /**
   * Creates a number of records, as `create()` does each.
   * @param count - How many.
   * @param args - The fields of every record, or a function that makes them from the index.
   * @returns The records.
   * @example
   * db.plants.createMany(25, { gardenId: '1' })
   * db.plants.createMany(25, index => ({ gardenId: '1', name: `Seedling ${index + 1}` }))
   */
  createMany(count: number, ...args: CreateManyArgs<I>): Frozen<T[]>
  createMany(inputs: number | readonly I[], fields?: I | ((index: number) => I)) {
    const create = (input?: I) => (this.create as (fields?: I) => Readonly<T>)(input)

    if (typeof inputs !== 'number') {
      return Object.freeze(inputs.map(create))
    }

    return Object.freeze(Array.from({
      length: inputs
    }, (_, index) => create(
      typeof fields === 'function'
        ? (fields as (index: number) => I)(index)
        : fields
    )))
  }

  /**
   * Changes every record a selector picks, as `UPDATE` in SQL does: merges fields into each,
   * or lets a function edit a draft of each in place. The records keep their `id`.
   * @param select - An id, the fields the records should have, or a predicate.
   * @param patch - The fields to merge, or a function that edits a draft.
   * @returns The changed records: none when fields or a predicate pick no record.
   * @throws {Error} When there is no record with the id.
   * @example
   * db.plants.update('1', { name: 'Boston fern' })
   * db.plants.update({ gardenId: '1' }, { pictureIds: [] })
   * db.gardens.update('1', (garden) => {
   *   garden.location.city = 'London'
   * })
   */
  update(select: Select<T>, patch: Patch<T>): Frozen<T[]> {
    const match = matcher(select)
    const updated: T[] = []
    const rows = this.#state.rows.map((row) => {
      if (!match(row)) {
        return row
      }

      const next = patched(row, patch)

      updated.push(next)

      return next
    })

    assertPicked('update', select, updated)
    this.set(rows)

    return Object.freeze(updated)
  }

  /**
   * Deletes every record a selector picks, as `DELETE` in SQL does.
   * @param select - An id, the fields the records should have, or a predicate.
   * @returns The deleted records: none when fields or a predicate pick no record.
   * @throws {Error} When there is no record with the id.
   * @example
   * db.plants.delete('1')
   * db.plants.delete({ gardenId: '1' })
   */
  delete(select: Select<T>): Frozen<T[]> {
    const match = matcher(select)
    const { rows } = this.#state
    const deleted = rows.filter(match)

    assertPicked('delete', select, deleted)
    this.set(rows.filter(row => !match(row)))

    return Object.freeze(deleted)
  }

  /**
   * Replaces the records with the given ones: the way to filter, sort or cut a collection
   * with array methods. New records are numbered on from where they were.
   * @param rows - The records the collection holds from now on.
   * @returns The collection.
   * @example
   * db.posts.set(db.posts.get().slice(0, 4))
   * db.reports.set([])
   */
  set(rows: readonly T[]): this {
    this.#state = {
      rows: Object.freeze(rows.map(row => frozen(row))),
      seq: this.#state.seq
    }

    return this
  }

  /**
   * Makes an independent copy of the collection: the same records and parameters. The copy
   * and the collection do not see each other's changes from then on, and `reset()` brings
   * the copy back to these records.
   * @returns The copy.
   */
  fork(): Collection<T, I> {
    const {
      id,
      entity
    } = this.#options
    const fork = new Collection<T, I>({
      id,
      entity
    })

    fork.#state = this.#state
    fork.#initial = fork.#state

    return fork
  }

  /**
   * Brings the collection back to where it started: to what it was made or forked with. New
   * records are numbered as they were then.
   * @returns The collection.
   * @example
   * db.plants.reset()
   */
  reset(): this {
    this.#state = this.#initial

    return this
  }
}

/**
 * Creates a collection: on its own, or as a part of a virtual database.
 *
 * Ids are the strings `'1'`, `'2'` and so on. When the `id` of a record is of another type,
 * the collection has to be told how to make one.
 * @param args
 * @returns The collection.
 * @example
 * const db = virtualDatabase({
 *   gardens: collection<Garden>(),
 *   posts: collection<Post>({ id: seq => seq })
 * })
 */
export function collection<T extends Row>(
  ...args: Partial<PlainOptions<T>> extends PlainOptions<T>
    ? [options?: PlainOptions<T>]
    : [options: PlainOptions<T>]
): Collection<T>
/**
 * Creates a collection with an entity: it makes every field of a new record, so `create()`
 * is told only what differs.
 * @param options - How the collection makes ids and the fields of a new record.
 * @returns The collection.
 * @example
 * const db = virtualDatabase({
 *   gardens: collection<Garden>({ entity: seq => ({ name: `Garden ${seq}` }) }),
 *   plants: collection<Plant>({ entity: createPlant })
 * })
 *
 * db.gardens.create()
 * db.plants.create({ gardenId: '1' })
 */
export function collection<T extends Row>(
  options: WithId<T, CollectionOptions<T>>
): Collection<T, PartialInput<T>>

/* @__NO_SIDE_EFFECTS__ */
export function collection<T extends Row>(options?: CollectionOptions<T>): Collection<T, unknown> {
  return new Collection(options)
}
