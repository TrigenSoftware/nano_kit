import {
  type WritableSignal,
  type Morph,
  type NewValue,
  morph,
  signal,
  untracked
} from 'kida'

export interface ExternalOverrides<T> extends Partial<Omit<Morph<T>, 'source'>> {}

export type ExternalFactory<T> = ($source: WritableSignal<T>, ops: ExternalOverrides<T>) => void

export interface External<T> extends Morph<T> {
  factory: ExternalFactory<T>
}

function lazyGetterSetter<T>(this: External<T>, ...value: [NewValue<T>]): T | void {
  const $source = this.source
  const ops: ExternalOverrides<T> = {}

  untracked(() => this.factory($source, ops))

  this.get = ops.get ?? $source
  this.set = ops.set ?? $source

  if (value.length) {
    this.set(value[0])
  } else {
    return this.get()
  }
}

/**
 * Create a signal that is controlled by an external source.
 * @param factory - The factory function.
 * @returns The external signal.
 */
/* @__NO_SIDE_EFFECTS__ */
export function external<T>(
  factory: ExternalFactory<T>
) {
  return morph(signal<T>(), {
    get: lazyGetterSetter as () => T,
    set: lazyGetterSetter,
    factory
  }) as WritableSignal<T>
}
