import {
  type Signalish,
  $get,
  pick
} from 'nanoviews/store'
import {
  type Attributes,
  span,
  component$
} from 'nanoviews'
import styles from './Duration.module.css'

export type DurationTone = 'warning' | 'danger'

export interface DurationProps extends Attributes<'span'> {
  /**
   * In milliseconds.
   */
  ms: Signalish<number>
  /**
   * Sets the duration apart. Without one it reads as plain text.
   */
  tone?: Signalish<DurationTone | undefined>
}

// The least duration the text tells apart from none, in milliseconds
const LEAST = 0.1

/**
 * A duration as text, to a tenth of a millisecond.
 * @param ms - In milliseconds.
 * @returns The text.
 */
export function formatDuration(ms: number) {
  return ms < LEAST ? `<${LEAST} ms` : `${ms.toFixed(1)} ms`
}

/**
 * A duration to a tenth of a millisecond: plain, or set apart by its tone.
 */
export const Duration = component$(({
  class: className,
  ms,
  tone,
  ...restProps
}: DurationProps) => (
  span({
    class: [
      className,
      styles.root,
      pick(styles, tone)
    ],
    ...restProps
  })(
    () => formatDuration($get(ms))
  )
))
