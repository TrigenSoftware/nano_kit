import { useSignal } from '@nano_kit/react'
import cx from 'clsx'
import { $applicationCount } from '~/stores/application'
import {
  paths,
  $location
} from '~/stores/router'
import { GOAL_APPLICATIONS } from '~/constants'
import {
  type PaperProps,
  Paper
} from '~/uikit/Paper'
import { Button } from '~/uikit/Button'
import { Icon } from '~/uikit/Icon'
import { Steps } from '~/uikit/Steps'
import typography from '~/uikit/typography.module.css'
import styles from './CallToAction.module.css'

export interface CallToActionProps extends Omit<PaperProps, 'color' | 'as'> {}

export function CallToAction({
  className,
  ...props
}: CallToActionProps) {
  const route = useSignal($location.$route)
  const count = useSignal($applicationCount)

  if (count >= GOAL_APPLICATIONS || route === 'newApplication') {
    return null
  }

  return (
    <Paper
      as='aside'
      className={cx(styles.root, className)}
      color='success'
      {...props}
    >
      <h2 className={typography.h2}>Hit your goal</h2>
      <p className={cx(typography.text, typography.lg)}>
        Generate and send out couple more job applications today to get hired faster
      </p>
      <Button
        as='a'
        href={paths.newApplication}
        variant='primary'
        size='lg'
        icon={<Icon name='plus'/>}
      >
        Create New
      </Button>
      <div
        className={styles.steps}
      >
        <Steps
          size='lg'
          max={GOAL_APPLICATIONS}
          value={count}
        />
        <p className={cx(typography.text, typography.lg)}>
          {count}
          {' '}
          out of
          {' '}
          {GOAL_APPLICATIONS}
        </p>
      </div>
    </Paper>
  )
}
