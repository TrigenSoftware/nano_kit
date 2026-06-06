import { useSignal } from '@nano_kit/react'
import { useCallback } from 'react'
import cx from 'clsx'
import {
  $currentApplication,
  $upsertApplicationLoading
} from '~/stores/application'
import { useTextBlink } from '~/uikit/hooks'
import {
  type LetterCardProps,
  LetterCard
} from '~/uikit/LetterCard'
import { LetterCardContent } from '~/uikit/LetterCard/LetterCardContent'
import { LetterCardFooter } from '~/uikit/LetterCard/LetterCardFooter'
import { Button } from '~/uikit/Button'
import { Icon } from '~/uikit/Icon'
import { Thinker } from '~/uikit/Thinker'
import { BLINK_DURATION } from '~/constants'
import styles from './ApplicationLetter.module.css'

export interface ApplicationLetterProps extends LetterCardProps {}

export function ApplicationLetter({
  className,
  ...props
}: ApplicationLetterProps) {
  const currentApplication = useSignal($currentApplication)
  const isLoading = useSignal($upsertApplicationLoading)
  const [copiedText, copied] = useTextBlink('Copied!', BLINK_DURATION)
  const letter = currentApplication?.letter
  const onCopyCallback = useCallback(() => {
    if (letter) {
      void navigator.clipboard
        .writeText(letter)
        .then(copied)
    }
  }, [letter, copied])

  return (
    <LetterCard
      className={cx(styles.root, className)}
      {...props}
    >
      {isLoading && (
        <div className={styles.loader}>
          <Thinker label='Loading...'/>
        </div>
      )}
      <LetterCardContent
        className={cx(styles.content, isLoading && styles.hidden)}
        placeholder='Your personalized job application will appear here...'
        value={letter}
      />
      <LetterCardFooter
        className={cx(styles.footer, isLoading && styles.hidden)}
      >
        {Boolean(letter) && (
          <Button
            icon={<Icon name='copy'/>}
            iconAlign='right'
            size='sm'
            variant='subtle'
            onClick={onCopyCallback}
          >
            {copiedText || 'Copy to clipboard'}
          </Button>
        )}
      </LetterCardFooter>
    </LetterCard>
  )
}
