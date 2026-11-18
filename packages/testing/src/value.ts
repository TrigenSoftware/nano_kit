import type {
  Frozen,
  State
} from './types.js'
import { frozen } from './utils.js'

/**
 * A single value: what is not a list of records, such as the session. A virtual database
 * reads and assigns it as a property of its own.
 *
 * The value is read-only, as records are: to change it, `set()` a new one.
 */
export class Value<T> implements State<T> {
  #state: Frozen<T>
  #initial: Frozen<T>

  constructor(initial?: T) {
    // Without an initial value, the value is `undefined` until `set()` gives one
    this.#state = frozen(initial as T)
    this.#initial = this.#state
  }

  /**
   * Gets the value.
   * @returns The value.
   */
  get(): Frozen<T> {
    return this.#state
  }

  /**
   * Replaces the value.
   * @param value - The new value.
   * @returns The value holder, to go on with.
   */
  set(value: T): this {
    this.#state = frozen(value)

    return this
  }

  /**
   * Makes an independent copy of the value, which `reset()` brings back to this value.
   * @returns The copy.
   */
  fork(): Value<T> {
    const fork = new Value<T>()

    fork.#state = this.#state
    fork.#initial = fork.#state

    return fork
  }

  /**
   * Brings the value back to where it started: to what it was made or forked with.
   * @returns The value holder, to go on with.
   */
  reset(): this {
    this.#state = this.#initial

    return this
  }
}

/**
 * Creates a single value that holds `undefined` until `set()` gives it something.
 * @returns The value.
 * @example
 * const session = value<string>()
 *
 * session.get() // undefined
 */
export function value<T>(): Value<T | undefined>
/**
 * Creates a single value: on its own, or as a part of a virtual database, which reads and
 * assigns it as a property of its own.
 * @param initial - What the value holds at first.
 * @returns The value.
 * @example
 * const db = virtualDatabase({
 *   session: value<string | null>(null)
 * })
 *
 * db.session = 'user-1'
 * db.session // 'user-1'
 */
export function value<T>(initial: T): Value<T>

/* @__NO_SIDE_EFFECTS__ */
export function value<T>(initial?: T): Value<T> {
  return new Value(initial)
}
