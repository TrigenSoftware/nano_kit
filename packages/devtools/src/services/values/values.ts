import { isSignal } from '@nano_kit/store'
import type { ValueEntry } from './values.types.js'

// A preview is one line of about this many characters
const BUDGET = 80
// and of this many entries of a collection at most
const SHOWN = 5

/**
 * Stands in for the value of an accessor property: a getter is application code, and inspection never runs it.
 */
export const Getter = /* @__PURE__ */ Symbol('getter')

function isIndexed(value: object): value is ArrayLike<unknown> {
  return Array.isArray(value) || ArrayBuffer.isView(value)
}

function isSized(value: object): value is Map<unknown, unknown> | Set<unknown> {
  return value instanceof Map || value instanceof Set
}

// Entries of a value from the given one on, produced one at a time: a preview stops after a few,
// a page of the tree after its limit, and neither walks the whole collection
function* pairs(value: object, from: number): Generator<[key: unknown, value: unknown]> {
  let index = 0

  if (isIndexed(value)) {
    for (index = from; index < value.length; index++) {
      yield [index, value[index]]
    }
  } else if (isSized(value)) {
    const keyed = value instanceof Map

    for (const item of value) {
      if (index >= from) {
        yield keyed ? item as [unknown, unknown] : [index, item]
      }

      index++
    }
  } else {
    for (const key in value) {
      if (Object.hasOwn(value, key) && index++ >= from) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key)!

        yield [key, 'value' in descriptor ? descriptor.value : Getter]
      }
    }
  }
}

function formatObject(value: object, budget: number, nested: boolean) {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? 'Invalid Date' : value.toISOString()
  }

  if (value instanceof RegExp || value instanceof Error) {
    return String(value)
  }

  // A prototype may come without a constructor, `Object.create(null)` and what is built on it
  const name = (Object.getPrototypeOf(value) as { constructor?: { name?: string } } | null)?.constructor?.name
  const indexed = isIndexed(value)
  const sized = isSized(value)
  const label = indexed
    ? `${name}(${value.length})`
    : sized
      ? `${name}(${value.size})`
      : name !== 'Object' && name
  const prefix = label ? `${label} ` : ''

  if (nested) {
    return indexed || sized ? label as string : `${prefix}{…}`
  }

  const keyed = value instanceof Map
  let text = prefix + (indexed ? '[' : '{')
  let shown = 0

  for (const [key, child] of pairs(value, 0)) {
    const room = budget - text.length

    if (shown === SHOWN || room <= 0) {
      text += shown ? ', …' : '…'
      break
    }

    if (shown++) {
      text += ', '
    }

    if (keyed) {
      text += `${format(key, room, true)} => `
    } else if (!indexed && !sized) {
      text += `${key as string}: `
    }

    text += format(child, room, true)
  }

  return text + (indexed ? ']' : '}')
}

function format(value: unknown, budget: number, nested: boolean): string {
  if (typeof value === 'string') {
    return JSON.stringify(value.length > budget ? `${value.slice(0, budget)}…` : value)
  }

  if (typeof value === 'bigint') {
    return `${value}n`
  }

  if (typeof value === 'function') {
    return isSignal(value) ? 'Signal' : `ƒ ${value.name}()`
  }

  if (value === Getter) {
    return '(…)'
  }

  return typeof value === 'object' && value
    ? formatObject(value, budget, nested)
    : String(value)
}

/**
 * One bounded line about a value, in the manner of a browser console: primitives as they are written,
 * a collection with its size and first entries, anything nested one level down folded.
 * The line is plain text detached from the value, so it is what the log keeps.
 * @param value
 * @param budget - About how many characters the line may take; a string alone is cut to exactly that.
 * @returns The line.
 */
export function preview(value: unknown, budget = BUDGET) {
  return format(value, budget, false)
}

/**
 * How many entries a value has: what a tree node pages through, and zero for a leaf.
 * @param value
 * @returns The number of entries.
 */
export function sizeOf(value: unknown) {
  return typeof value === 'object' && value
    ? isIndexed(value)
      ? value.length
      : isSized(value)
        ? value.size
        : Object.keys(value).length
    : 0
}

/**
 * One page of the entries of a value, read from the live value when a tree node expands:
 * a value is never serialized in depth, so cycles and sheer size cost nothing.
 * @param value
 * @param from - Index of the first entry of the page.
 * @param limit - Size of the page.
 * @returns The entries.
 */
export function entriesOf(value: object, from: number, limit: number) {
  const keyed = value instanceof Map
  const entries: ValueEntry[] = []

  for (const [key, child] of pairs(value, from)) {
    if (entries.push({
      name: keyed ? format(key, BUDGET, true) : String(key),
      value: child
    }) === limit) {
      break
    }
  }

  return entries
}
