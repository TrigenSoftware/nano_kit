import {
  type Attributes,
  tbody,
  component$
} from 'nanoviews'

export type TableBodyProps = Attributes<'tbody'>

/**
 * Body of a `Table`: put `TableRow`s inside.
 */
export const TableBody = component$((props: TableBodyProps, children) => (
  tbody(props)(
    ...children
  )
))
