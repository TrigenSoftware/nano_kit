import {
  type Signalish,
  isAccessor
} from 'kida'
import {
  type Child,
  swap
} from '../internals/index.js'

/**
 * Render a child decided by a value. Unlike a binding, which updates content
 * in place, the child is built anew every time the value changes.
 * @param $value - Static value or store
 * @param render - Function that returns child for the value
 * @returns Block that renders the child and swaps it on change
 */
export function swap_<T>(
  $value: Signalish<T>,
  render: (value: T) => Child
) {
  if (isAccessor($value)) {
    return swap($value, render)
  }

  return render($value)
}
