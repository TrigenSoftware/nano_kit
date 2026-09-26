import {
  type Signalish,
  is,
  when
} from 'nanoviews/store'
import {
  type Attributes,
  th,
  component$
} from 'nanoviews'
import styles from './TableHeadCell.module.css'

export interface TableHeadCellProps extends Omit<Attributes<'th'>, 'align'> {
  align?: Signalish<'start' | 'end'>
}

export const TableHeadCell = component$(({
  class: className,
  align,
  ...restProps
}: TableHeadCellProps, children) => (
  th({
    class: [
      className,
      styles.root,
      when(is(align, 'end'), styles.end)
    ],
    scope: 'col',
    ...restProps
  })(
    ...children
  )
))
