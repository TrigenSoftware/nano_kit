import {
  type Signalish,
  when
} from 'nanoviews/store'
import {
  type Attributes,
  span,
  component$
} from 'nanoviews'
import styles from './Beacon.module.css'

export interface BeaconProps extends Attributes<'span'> {
  /**
   * Plays one pulse while true: flip it on for each event to show.
   */
  active?: Signalish<boolean>
}

/**
 * A live dot: steady while connected, pulsing on activity.
 */
export const Beacon = component$(({
  class: className,
  active,
  ...restProps
}: BeaconProps) => (
  span({
    class: [
      className,
      styles.root,
      when(active, styles.active)
    ],
    ...restProps
  })
))
