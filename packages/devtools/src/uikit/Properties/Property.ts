import type { Signalish } from 'nanoviews/store'
import {
  dt,
  dd,
  component$,
  fragment
} from 'nanoviews'
import styles from './Property.module.css'

export interface PropertyProps {
  name: Signalish<string>
}

export const Property = component$(({ name }: PropertyProps, children) => (
  fragment(
    dt({
      class: styles.name
    })(
      name
    ),
    dd({
      class: styles.value
    })(
      ...children
    )
  )
))
