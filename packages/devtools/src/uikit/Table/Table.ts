import {
  type Signalish,
  type WritableSignal,
  signal,
  selector,
  provide
} from 'nanoviews/store'
import {
  type Attributes,
  type FocusEvent,
  div,
  table,
  component$,
  context$
} from 'nanoviews'
import styles from './Table.module.css'

export interface TableProps extends Attributes<'div'> {
  /**
   * Accessible name of the grid.
   */
  label: Signalish<string>
}

export interface TableFocus {
  /**
   * The row the tab stops at, the one focused last, by an identity of its own. None until a row
   * is focused and once that row is gone: the tab stops at the table itself then.
   */
  $active: WritableSignal<object | undefined>
  /**
   * Whether the row is the one the tab stops at. Wakes only the row that became it and the one that stopped being it.
   */
  $isActive(row: object): boolean
}

/**
 * The one tab stop the rows of a `Table` share.
 * @returns A tab stop of its own.
 */
export function TableFocus$(): TableFocus {
  const $active = signal<object>()

  return {
    $active,
    $isActive: selector($active)
  }
}

// The tab reached the table: the selected row takes the focus, or the first one
function onTableFocus({ target }: FocusEvent<HTMLTableElement>) {
  const row = target.querySelector<HTMLElement>('tbody > [aria-selected="true"]')
    ?? target.querySelector<HTMLElement>('tbody > tr')

  row?.focus()
}

/**
 * Tree grid over a real table: rows are flat, the nesting is the indent of `TableRow`'s level.
 * Put a `TableHead` and a `TableBody` inside; the root scrolls, the head sticks. The rows share one
 * tab stop and are walked with the arrows.
 */
export const Table = component$(({
  class: className,
  label,
  ...restProps
}: TableProps, children) => {
  const focus = TableFocus$()

  return (
    context$(provide(TableFocus$, focus))(
      div({
        class: [className, styles.root],
        ...restProps
      })(
        table({
          class: styles.table,
          role: 'treegrid',
          'aria-label': label,
          // The tab stops at the table only while no row holds the stop, and hands the focus on
          tabIndex: () => (focus.$active() ? undefined : 0),
          onFocus: onTableFocus
        })(
          ...children
        )
      )
    )
  )
})
