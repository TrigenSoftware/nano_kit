import {
  type Signalish,
  is
} from 'nanoviews/store'
import {
  type Attributes,
  label,
  input,
  component$,
  inject
} from 'nanoviews'
import { TabsGroup$ } from './Tabs.js'
import styles from './Tab.module.css'

export interface TabProps extends Attributes<'label'> {
  /**
   * The value this tab selects.
   */
  value: string
  disabled?: Signalish<boolean>
}

export const Tab = component$(({
  class: className,
  value,
  disabled,
  ...restProps
}: TabProps, children) => {
  const {
    name,
    $value
  } = inject(TabsGroup$)

  return (
    label({
      class: [className, styles.root],
      ...restProps
    })(
      input({
        class: styles.input,
        type: 'radio',
        name,
        value,
        disabled,
        checked: is($value, value)
      }),
      ...children
    )
  )
})
