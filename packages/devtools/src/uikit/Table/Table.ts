import type { Signalish } from 'nanoviews/store'
import {
  type Attributes,
  div,
  table,
  component$
} from 'nanoviews'
import styles from './Table.module.css'

export interface TableProps extends Attributes<'div'> {
  /**
   * Accessible name of the grid.
   */
  label: Signalish<string>
}

/**
 * Tree grid over a real table: rows are flat, the nesting is the indent of `TableRow`'s level.
 * Put a `TableHead` and a `TableBody` inside; the root scrolls, the head sticks.
 */
export const Table = component$(({
  class: className,
  label,
  ...restProps
}: TableProps, children) => (
  div({
    class: [className, styles.root],
    ...restProps
  })(
    table({
      class: styles.table,
      role: 'treegrid',
      'aria-label': label
    })(
      ...children
    )
  )
))
