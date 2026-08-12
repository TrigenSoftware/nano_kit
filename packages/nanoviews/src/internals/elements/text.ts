import {
  type Accessor,
  effect
} from 'kida'
import type { Primitive } from '../types/index.js'

export function createTextNode(value: unknown = '') {
  return document.createTextNode(value as string)
}

/**
 * Create a reactive text node
 * @param $value - Reactive or static value
 * @returns Text node
 */
export function createTextNodeFromAccessor<T extends Primitive>($value: Accessor<T>) {
  const node = createTextNode()

  // The body only writes to the DOM, so it is the whole binding.
  // `??` is exactly the empty check: an empty value is a nullish one
  effect(() => {
    node.data = $value() as string ?? ''
  }, true)

  return node
}
