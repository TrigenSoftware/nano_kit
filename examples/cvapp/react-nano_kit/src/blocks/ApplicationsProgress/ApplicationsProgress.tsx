import type { HTMLAttributes } from 'react'
import { useSignal } from '@nano_kit/react'
import cx from 'clsx'
import typography from '~/uikit/typography.module.css'
import { $applicationCount } from '~/stores/application'
import { GOAL_APPLICATIONS } from '~/constants'
import { Steps } from '~/uikit/Steps'
import { Icon } from '~/uikit/Icon'
import styles from './ApplicationsProgress.module.css'

export interface ApplicationsProgressProps extends HTMLAttributes<HTMLDivElement> {}

export function ApplicationsProgress({
  className,
  ...props
}: ApplicationsProgressProps) {
  const count = useSignal($applicationCount)
  const isComplete = count >= GOAL_APPLICATIONS

  if (count > GOAL_APPLICATIONS) {
    return null
  }

  const text = `${count}/${GOAL_APPLICATIONS} applications generated`

  return (
    <div
      className={cx(styles.root, className)}
      role='status'
      aria-label={text}
      {...props}
    >
      <span
        className={cx(typography.text, typography.lg, styles.text)}
        aria-hidden='true'
      >
        {text}
      </span>
      {isComplete
        ? (
          <Icon
            className={styles.icon}
            name='check'
          />
        )
        : (
          <Steps
            max={GOAL_APPLICATIONS}
            size='md'
            value={count}
          />
        )}
    </div>
  )
}
