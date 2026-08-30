import {
  type Signalish,
  isAccessor
} from 'kida'
import {
  type Child,
  show
} from '../internals/index.js'

/**
 * Render a child that lives regardless of the value: the tree is built once
 * and `noDefer` effects keep it up to date, but it stands in the document
 * with its deferred effects running only while the value is truthy.
 * @param $value - Static value or store
 * @param render - Function that returns the child
 * @returns Block that shows and hides the child
 */
export function show_($value: Signalish<unknown>, render: () => Child) {
  if (isAccessor($value)) {
    return show($value, render)
  }

  return $value ? render() : null
}
