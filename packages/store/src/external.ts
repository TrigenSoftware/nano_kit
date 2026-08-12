import {
  type Accessor,
  type WritableSignal,
  type NewValue,
  createSignal,
  signal,
  untracked
} from 'kida'
import {
  type FacadeNode,
  facadeOper
} from './facade.js'

export interface ExternalOverrides<T> {
  get?: () => T
  set?: (value: NewValue<T>) => void
}

export type ExternalFactory<T> = ($source: WritableSignal<T>, ops: ExternalOverrides<T>) => void

/**
 * Create a signal that is controlled by an external source.
 * @param factory - The factory function.
 * @returns The external signal.
 */
/* @__NO_SIDE_EFFECTS__ */
export function external<T>(
  factory: ExternalFactory<T>
) {
  const $source = signal<T>() as WritableSignal<T>
  const node = $source.node as FacadeNode<T>

  // Both faces start as the installer: the factory runs at the first read or
  // write, over a pair that already defaults to the source, and overrides
  // whichever side it wants
  node.get = node.set = ((...value: [NewValue<T>]) => {
    node.get = node.set = $source

    untracked(() => factory($source, node))

    return value.length ? node.set(value[0]) : node.get()
  }) as Accessor<T>

  return createSignal(facadeOper, node) as WritableSignal<T>
}
