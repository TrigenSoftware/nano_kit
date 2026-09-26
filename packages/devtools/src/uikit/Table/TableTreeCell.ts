import { inject } from 'nanoviews/store'
import {
  type Attributes,
  td,
  div,
  span,
  component$
} from 'nanoviews'
import { Disclosure } from '../Disclosure/index.js'
import { TableRowTree$ } from './TableRow.js'
import styles from './TableCell.module.css'

export type TableTreeCellProps = Attributes<'td'>

/**
 * First cell of a `TableRow`: the chevron of a row with children, or the same space left empty for a leaf,
 * so the names of one level line up.
 */
export const TableTreeCell = component$(({
  class: className,
  ...restProps
}: TableTreeCellProps, children) => {
  const tree = inject(TableRowTree$)

  return (
    td({
      class: [className, styles.root],
      ...restProps
    })(
      div({
        class: styles.content
      })(
        tree?.$expanded
          ? Disclosure({
            class: styles.slot,
            // The row opens and closes itself on the arrows and holds the tab stop: the chevron is for the mouse
            tabIndex: -1,
            $expanded: tree.$expanded,
            label: tree.label
          })
          : span({
            class: styles.slot
          }),
        ...children
      )
    )
  )
})
