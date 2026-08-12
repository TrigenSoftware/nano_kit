import type {
  Accessor,
  NewValue,
  SignalNode
} from 'kida'

/**
 * A node wearing a second face: the signal function in front of it reads
 * through `get` and writes through `set`, while the node itself - and the
 * signal originally bound to it - stay exactly what they were.
 */
export interface FacadeNode<T = unknown> extends SignalNode<T> {
  get: Accessor<T>
  set(value: NewValue<T>): void
}

export function facadeOper<T>(this: FacadeNode<T>, ...value: [NewValue<T>]): T | void {
  if (value.length) {
    this.set(value[0])
  } else {
    return this.get()
  }
}
