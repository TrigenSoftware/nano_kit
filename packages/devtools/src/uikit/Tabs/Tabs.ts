import {
  type Signalish,
  type WritableSignal,
  DependencyNotFound
} from 'nanoviews/store'
import {
  type Attributes,
  type ChangeEvent,
  div,
  component$,
  context$,
  provide
} from 'nanoviews'
import styles from './Tabs.module.css'

export interface TabsProps extends Attributes<'div'> {
  /**
   * Accessible name of the group.
   */
  label: Signalish<string>
  /**
   * The selected value, shared with the `Tab`s inside.
   */
  $value: WritableSignal<string>
  /**
   * Radio group name; generated when omitted.
   */
  name?: string
}

export interface TabsGroup {
  name: string
  $value: WritableSignal<string>
}

/**
 * The radio group of the enclosing `Tabs`, for its `Tab`s.
 */
export function TabsGroup$(): TabsGroup {
  throw new DependencyNotFound('TabsGroup$')
}

let groupCount = 0

/**
 * Segmented control over a native radio group: the arrow keys, the focus and the exclusivity come from the radios,
 * each `Tab` is checked by the value, the `change` bubbling up from any of them writes it.
 */
export const Tabs = component$(({
  class: className,
  label,
  $value,
  name = `tabs-${++groupCount}`,
  onChange,
  ...restProps
}: TabsProps, children) => (
  context$(provide(TabsGroup$, {
    name,
    $value
  }))(
    div({
      class: [className, styles.root],
      role: 'radiogroup',
      'aria-label': label,
      onChange(event: ChangeEvent<HTMLInputElement>) {
        $value(event.target.value)
        onChange?.(event)
      },
      ...restProps
    })(
      ...children
    )
  )
))
