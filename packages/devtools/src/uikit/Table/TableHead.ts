import {
  type Attributes,
  thead,
  tr,
  component$
} from 'nanoviews'
import styles from './TableHead.module.css'

export type TableHeadProps = Attributes<'thead'>

/**
 * Header of a `Table`, one row of `TableHeadCell`s. It sticks to the top while the table scrolls.
 */
export const TableHead = component$(({
  class: className,
  ...restProps
}: TableHeadProps, children) => (
  thead({
    class: [className, styles.root],
    ...restProps
  })(
    tr()(
      ...children
    )
  )
))
