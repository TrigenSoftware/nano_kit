import {
  type ToAccessor,
  toAccessor
} from 'kida'

/**
 * Props with a `$`-prefixed accessor twin for every prop that has no own
 * `$`-prefixed prop of that name.
 */
export type Props$<T> = T & {
  [K in keyof T as `$${string & K}` extends keyof T ? never : `$${string & K}`]: ToAccessor<Exclude<T[K], undefined>>
}

/**
 * Read any prop of a component in accessor form.
 *
 * `$name` is an accessor for `props.name`: the prop itself when it already is
 * an accessor or a signal, a wrapper when it is a static value, and
 * `undefined` when the prop is not set, so a destructuring default can fill it
 * in. `name` is the prop as it arrived. A prop read as `$name` is left out of
 * the rest, and stays readable as `name`.
 * @param props - Props object
 * @returns Props with accessors
 * @example
 * ```ts
 * const {
 *   $size = $defaultSize,
 *   $primary,
 *   ...restProps
 * } = props$(props)
 * ```
 */
/* @__NO_SIDE_EFFECTS__ */
export function props$<T extends object>(props: T) {
  // The keys the rest is built from. A prop taken as `$name` leaves this list,
  // which is the only way it can leave the rest: destructuring excludes the
  // names written in the pattern, and `$name` is not `name`
  const keys = Reflect.ownKeys(props)

  return new Proxy(props as Record<string, unknown>, {
    get(target, key: string) {
      // A prop named with a `$` of its own wins over the twin, and so does the
      // accessor of a prop already taken: both are own keys by then
      if (!(key in target) && key[0] === '$') {
        const name = key.slice(1)
        const index = keys.indexOf(name)

        if (index > -1) {
          keys.splice(index, 1)
        }

        // The accessor lives on the props object so that it is found by the
        // check above and stays the same on every read. It is hidden from
        // enumeration: the props object is the caller's, and it keeps every
        // prop it came with
        Reflect.defineProperty(target, key, {
          // An absent prop stays absent, so a destructuring default fills in
          value: target[name] === undefined ? undefined : toAccessor(target[name]),
          configurable: true
        })
      }

      return target[key]
    },
    ownKeys() {
      return keys
    }
  }) as Props$<T>
}
