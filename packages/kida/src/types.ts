export type * from './internals/types.js'

export type KeysOf<U> = U extends unknown
  ? keyof U
  : never

// oxlint-disable-next-line typescript/no-explicit-any
export type ValueOfKey<U, K extends PropertyKey> = U extends any
  ? K extends keyof U
    ? U[K]
    : undefined
  : never

export type RequiredMergeUnion<U> = {
  [K in KeysOf<U>]: ValueOfKey<U, K>
}
