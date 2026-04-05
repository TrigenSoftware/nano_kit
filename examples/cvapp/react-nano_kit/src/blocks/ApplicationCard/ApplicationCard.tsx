import { useCallback } from 'react'
import cx from 'clsx'
import { deleteApplication } from '~/stores/application'
import { paths } from '~/stores/router'
import { useTextBlink } from '~/uikit/hooks'
import type { Application } from '~/services/application.types'
import mixins from '~/uikit/mixins.module.css'
import {
  type LetterCardProps,
  LetterCard
} from '~/uikit/LetterCard'
import { LetterCardContent } from '~/uikit/LetterCard/LetterCardContent'
import { LetterCardFooter } from '~/uikit/LetterCard/LetterCardFooter'
import { Button } from '~/uikit/Button'
import { Icon } from '~/uikit/Icon'
import { BLINK_DURATION } from '~/constants'
import styles from './ApplicationCard.module.css'

export interface ApplicationCardProps extends LetterCardProps {
  application: Application
}

export function ApplicationCard({
  application,
  ...props
}: ApplicationCardProps) {
  const { letter, id } = application
  const [copiedText, copied] = useTextBlink('Copied!', BLINK_DURATION)
  const onCopyCallback = useCallback(() => {
    void navigator.clipboard
      .writeText(letter)
      .then(copied)
  }, [letter, copied])
  const onDeleteCallback = useCallback(() => {
    // eslint-disable-next-line no-alert
    if (confirm('Are you sure you want to delete this application letter?')) {
      void deleteApplication(id)
    }
  }, [id])

  return (
    <LetterCard
      {...props}
    >
      <a
        className={cx(styles.link, mixins.focusOutline)}
        href={paths.application({
          id
        })}
        aria-label='View application details'
      >
        <LetterCardContent
          maxLines={6}
          value={letter}
        />
      </a>
      <LetterCardFooter>
        <Button
          icon={<Icon name='trash'/>}
          size='sm'
          variant='subtle'
          color='danger'
          onClick={onDeleteCallback}
        >
          Delete
        </Button>
        <Button
          icon={<Icon name='copy'/>}
          iconAlign='right'
          size='sm'
          variant='subtle'
          onClick={onCopyCallback}
        >
          {copiedText || 'Copy to clipboard'}
        </Button>
      </LetterCardFooter>
    </LetterCard>
  )
}
