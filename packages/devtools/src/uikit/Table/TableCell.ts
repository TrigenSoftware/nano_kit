import {
  type Signalish,
  is,
  when
} from 'nanoviews/store'
import {
  type Attributes,
  td,
  div,
  component$
} from 'nanoviews'
import styles from './TableCell.module.css'

export interface TableCellProps extends Omit<Attributes<'td'>, 'align'> {
  align?: Signalish<'start' | 'end'>
}

export const TableCell = component$(({
  class: className,
  align,
  ...restProps
}: TableCellProps, children) => (
  td({
    class: [
      className,
      styles.root,
      when(is(align, 'end'), styles.end)
    ],
    ...restProps
  })(
    div({
      class: styles.content
    })(
      ...children
    )
  )
))
