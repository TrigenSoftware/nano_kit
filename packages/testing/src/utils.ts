import type {
  Row,
  Select
} from './collection.types.js'
import type {
  FalsyValue,
  Frozen
} from './types.js'

/* What `frozen()` made: frozen all the way down, so it is shared as it is */
const owned = /* @__PURE__ */ new WeakSet<object>()

function isPlainObject(value: object) {
  const proto: unknown = Object.getPrototypeOf(value)

  return proto === Object.prototype || proto === null
}

/**
 * Makes a read-only copy of a record, as `frozen()` does any data. A record is read-only at
 * its own fields: a generic `Frozen<T>` would not fit the record's type in generic code.
 * @param value
 * @returns The read-only copy.
 */
export function frozen<T extends Row>(value: T): Readonly<T>
/**
 * Makes a read-only copy of plain data, all the way down. The given value is left as it is,
 * so nothing a caller holds gets frozen under them. What is not plain data, such as a `Blob`
 * or a `Date`, is kept by reference.
 * @param value
 * @returns The read-only copy.
 */
export function frozen<T>(value: T): Frozen<T>

export function frozen(value: unknown): unknown {
  if (typeof value !== 'object' || value === null || owned.has(value)) {
    return value
  }

  let copy: object

  if (Array.isArray(value)) {
    copy = value.map(frozen)
  } else if (isPlainObject(value)) {
    copy = {}

    for (const key of Object.keys(value)) {
      (copy as Record<string, unknown>)[key] = frozen((value as Record<string, unknown>)[key])
    }
  } else {
    return value
  }

  owned.add(Object.freeze(copy))

  return copy
}

/**
 * Makes a copy of plain data that may be written to, all the way down. What is not plain
 * data is kept by reference.
 * @param value
 * @returns The writable copy.
 */
export function draft<T>(value: T): T {
  if (typeof value !== 'object' || value === null) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(draft) as T
  }

  if (!isPlainObject(value)) {
    return value
  }

  const copy: Record<string, unknown> = {}

  for (const key of Object.keys(value)) {
    copy[key] = draft((value as Record<string, unknown>)[key])
  }

  return copy as T
}

/**
 * Tells whether a selector picks a record by its id, rather than by fields or a predicate.
 * @param select
 * @returns Whether the selector is an id.
 */
export function isId<T extends Row>(select: Select<T>): select is T['id'] {
  return typeof select !== 'function' && (typeof select !== 'object' || select === null)
}

/**
 * Turns a selector into a predicate.
 * @param select - An id, the fields a record should have, or a predicate.
 * @returns The predicate.
 */
export function matcher<T extends Row>(select: Select<T>): (row: T) => unknown {
  if (typeof select === 'function') {
    return select
  }

  if (isId(select)) {
    return row => row.id === select
  }

  const keys = Object.keys(select) as (keyof T)[]

  return row => keys.every(key => row[key] === select[key])
}

/**
 * Leaves out the falsy items of a list: the recipes and handlers a condition skipped.
 * @param items
 * @returns The items that are given.
 */
export function compact<T>(items: readonly (T | FalsyValue)[]): T[] {
  return items.filter((item): item is T => Boolean(item))
}
