import type { Signalish } from 'nanoviews/store'
import {
  type Attributes,
  div,
  component$
} from 'nanoviews'
import styles from './ValueTree.module.css'

export interface ValueTreeProps extends Attributes<'div'> {
  /**
   * Accessible name of the tree.
   */
  label: Signalish<string>
}

/**
 * A value laid out as a tree: `ValueNode`s inside, nested through `ValueChildren`.
 * What a node says, its name, its preview and whether it can be expanded, is the caller's.
 */
export const ValueTree = component$(({
  class: className,
  label,
  ...restProps
}: ValueTreeProps, children) => (
  div({
    class: [className, styles.root],
    role: 'tree',
    'aria-label': label,
    ...restProps
  })(
    ...children
  )
))
