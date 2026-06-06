import {
  type HTMLAttributes,
  useMemo
} from 'react'
import cx from 'clsx'
import styles from './Steps.module.css'

export interface StepsProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max: number
  size?: 'md' | 'lg'
}

export function Steps({
  className,
  value,
  max,
  size = 'md',
  ...props
}: StepsProps) {
  const steps = useMemo(() => Array.from(
    {
      length: max
    },
    (_, index) => (
      <div
        key={index}
        className={cx(
          styles.step,
          index < value && styles.filled
        )}
      />
    )
  ), [max, value])

  return (
    <div
      className={cx(
        styles.root,
        styles[size],
        className
      )}
      aria-hidden='true'
      {...props}
    >
      {steps}
    </div>
  )
}
