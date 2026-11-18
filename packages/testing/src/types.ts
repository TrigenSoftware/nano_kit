/**
 * What a collection and a value have in common: a state to get and to set, independent
 * copies, and a way back to where the state started.
 */
export interface State<T> {
  /**
   * Gets the state, frozen: it changes only through `set()` and the other methods.
   * @returns The state.
   */
  get(): Frozen<T>
  /**
   * Replaces the state.
   * @param value - The new state.
   * @returns Itself, to go on with.
   */
  set(value: T): this
  /**
   * Makes an independent copy as it is now, which `reset()` brings back here.
   * @returns The copy.
   */
  fork(): State<T>
  /**
   * Brings the state back to where it started: to what it was made or forked with.
   * @returns Itself, to go on with.
   */
  reset(): this
}

/**
 * Data as a mock gives it out: frozen, so it is read-only. An array is read-only along with
 * its items, an object at its own fields only, so a record still fits the type it was made of.
 */
export type Frozen<T> = T extends readonly (infer U)[]
  ? readonly Readonly<U>[]
  : T extends object
    ? Readonly<T>
    : T

/**
 * What a list of recipes or handlers skips: the value of a condition that does not hold, so
 * `isEmpty && emptyGarden` fits right in the list.
 */
export type FalsyValue = false | 0 | '' | null | undefined
