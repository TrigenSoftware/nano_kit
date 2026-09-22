import {
  type Signalish,
  type WritableSignal,
  when
} from 'nanoviews/store'
import {
  type Attributes,
  tr,
  component$,
  context$,
  provide
} from 'nanoviews'
import styles from './TableRow.module.css'

export interface TableRowTree {
  /**
   * Name of the row: the accessible name of its chevron.
   */
  label: Signalish<string>
  /**
   * Expanded state of a row with children: its `TableTreeCell` gets the chevron. Leave unset for a leaf.
   */
  $expanded?: WritableSignal<boolean>
}

export interface TableRowProps extends Attributes<'tr'>, TableRowTree {
  /**
   * Depth in the tree, from 1. Indents the first cell by one chevron slot per level.
   */
  level?: number
  selected?: Signalish<boolean>
  /**
   * A row that names a group of rows: bold.
   */
  group?: Signalish<boolean>
}

/**
 * The tree state of the enclosing `TableRow`, for its `TableTreeCell`.
 * @returns Nothing: a leaf has none.
 */
export function TableRowTree$(): TableRowTree | undefined {
  return undefined
}

/**
 * Row of a `Table`: a `TableTreeCell` first, then `TableCell`s.
 */
export const TableRow = component$(({
  class: className,
  label,
  level = 1,
  $expanded,
  selected,
  group,
  ...restProps
}: TableRowProps, children) => (
  context$(provide(TableRowTree$, {
    label,
    $expanded
  }))(
    tr({
      class: [
        className,
        styles.root,
        when(group, styles.group)
      ],
      'aria-level': level,
      'aria-expanded': $expanded,
      'aria-selected': selected,
      style: {
        '--tableLevel': level
      },
      ...restProps
    })(
      ...children
    )
  )
))
