import { inject } from 'nanoviews/store'
import {
  type Attributes,
  div,
  span,
  fragment,
  component$,
  if_
} from 'nanoviews'
import { SignalsStore$ } from '../../stores/signals.js'
import typography from '../../uikit/typography.module.css'
import { NodeBox } from './NodeBox.js'
import { ValueBox } from './ValueBox.js'
import { LinksBox } from './LinksBox.js'
import styles from './Inspector.module.css'

export type InspectorProps = Attributes<'div'>

/**
 * The boxes about the selected row: what the node is, its value and its links. Each reads the
 * selection from the store, stays when it moves and follows it through its bindings.
 */
export const Inspector = component$(({
  class: className,
  ...restProps
}: InspectorProps) => {
  const { $selected } = inject(SignalsStore$)

  return (
    div({
      class: [className, styles.root],
      ...restProps
    })(
      if_($selected)(
        () => fragment(
          NodeBox(),
          ValueBox(),
          LinksBox()
        ),
        () => (
          span({
            class: [typography.secondary, styles.empty]
          })(
            'Select a row to inspect it.'
          )
        )
      )
    )
  )
})
