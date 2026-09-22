import {
  type Attributes,
  dl,
  component$
} from 'nanoviews'
import styles from './Properties.module.css'

export type PropertiesProps = Attributes<'dl'>

/**
 * Name and value pairs in two columns: put `Property`s inside.
 */
export const Properties = component$(({
  class: className,
  ...restProps
}: PropertiesProps, children) => (
  dl({
    class: [className, styles.root],
    ...restProps
  })(
    ...children
  )
))
