import type { UnionToIntersection } from './types.js'

type Split<
  T extends string,
  S extends string = '.'
> = string extends T
  ? [T]
  : T extends `${infer H}${S}${infer R}`
    ? [H, ...Split<R, S>]
    : [T]

type TupleOf<N extends number, T extends unknown[] = []> = T['length'] extends N
  ? T
  : TupleOf<N, [...T, unknown]>

type Add<A extends unknown[], B extends unknown[]> = [...A, ...B]

type IsAtDepth<
  L extends unknown[],
  D extends number
> = L extends [...TupleOf<D>, ...unknown[]] ? true : false

type Simplify<T> = T extends (...args: unknown[]) => unknown
  ? T
  : T extends object
    ? {
      [K in keyof T]: Simplify<T[K]>
    }
    : T

type PathObject<
  P extends readonly string[],
  V
> = P extends readonly [infer H extends string, ...infer R extends string[]]
  ? {
    [K in H]: R extends []
      ? V
      : PathObject<R, V>
  }
  : V

interface DeflatOpenTree<V> {
  [key: string]: V | DeflatOpenTree<V>
}

type DeflatOpenRecord<
  T extends Record<string, unknown>,
  D extends number,
  L extends unknown[]
> = IsAtDepth<L, D> extends true
  ? DeflatOpenTree<DeflatValue<T[string], D, [...L, unknown]>>
  : Record<string, DeflatValue<T[string], D, [...L, unknown]>>

type DeflatValue<
  T,
  D extends number,
  L extends unknown[]
> = T extends Record<string, unknown>
  ? string extends keyof T
    ? DeflatOpenRecord<T, D, L>
    : DeflatAt<T, D, L>
  : T

type DeflatEntry<
  K extends string,
  V,
  D extends number,
  L extends unknown[]
> = IsAtDepth<L, D> extends true
  ? PathObject<Split<K>, DeflatValue<V, D, Add<L, TupleOf<Split<K>['length']>>>>
  : {
    [P in K]: DeflatValue<V, D, [...L, unknown]>
  }

type DeflatAt<
  T extends Record<string, unknown>,
  D extends number,
  L extends unknown[]
> = Simplify<UnionToIntersection<{
  [K in keyof T & string]: DeflatEntry<K, T[K], D, L>
}[keyof T & string]>>

export type Deflat<
  T extends Record<string, unknown>,
  D extends number = 0
> = string extends keyof T
  ? DeflatOpenRecord<T, D, []>
  : DeflatAt<T, D, []>

export type DeflatFromDepth<T extends Record<string, unknown>> = Simplify<{
  [K in keyof T]: DeflatValue<T[K], 0, []>
}>

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null
    && typeof value === 'object'
    && Object.getPrototypeOf(value) === Object.prototype
}

function ensure(
  target: Record<string, unknown>,
  path: string[],
  offset = 0
) {
  let container = target

  for (let i = 0, len = path.length - offset, key; i < len; i++) {
    key = path[i]

    if (!isObject(container[key])) {
      container[key] = {}
    }

    container = container[key] as Record<string, unknown>
  }

  return container
}

function set(
  target: Record<string, unknown>,
  path: string[],
  value: unknown
) {
  const key = path[path.length - 1]
  const container = ensure(target, path, 1)

  container[key] = value
}

function assign(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
  depth: number,
  level: number
) {
  for (const [key, value] of Object.entries(source)) {
    const path = level >= depth ? key.split('.') : [key]

    if (isObject(value)) {
      assign(
        ensure(target, path),
        value,
        depth,
        level + path.length
      )
    } else {
      set(target, path, value)
    }
  }
}

/**
 * Deflates dotted object keys into nested objects.
 * @param input - Object with dotted keys.
 * @param depth - Nesting level where dotted keys should start being deflated.
 * @returns Nested object built from dotted keys.
 */
export function deflat<const T extends Record<string, unknown>>(
  input: T
): Deflat<T>

/**
 * Deflates dotted object keys into nested objects starting from a depth.
 * @param input - Object with dotted keys.
 * @param depth - Nesting level where dotted keys should start being deflated.
 * @returns Nested object built from dotted keys.
 */
export function deflat<
  const T extends Record<string, unknown>,
  const D extends number
>(
  input: T,
  depth: D
): Deflat<T, D>

/**
 * Deflates dotted object keys into nested objects starting from a depth.
 * @param input - Object with dotted keys.
 * @param depth - Nesting level where dotted keys should start being deflated.
 * @returns Nested object built from dotted keys.
 */
export function deflat<const T extends Record<string, unknown>>(
  input: T,
  depth: number
): DeflatFromDepth<T>

/* @__NO_SIDE_EFFECTS__ */
export function deflat(
  input: Record<string, unknown>,
  depth = 0
) {
  const output: Record<string, unknown> = {}

  assign(output, input, depth, 0)

  return output
}
