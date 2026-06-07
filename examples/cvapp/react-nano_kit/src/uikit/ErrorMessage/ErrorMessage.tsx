import type {
  HTMLAttributes,
  ReactNode
} from 'react'
import cx from 'clsx'
import typography from '../typography.module.css'
import styles from './ErrorMessage.module.css'

export interface ErrorMessageProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export function ErrorMessage({
  children,
  className,
  ...props
}: ErrorMessageProps) {
  if (!children) {
    return null
  }

  return (
    <div
      className={cx(styles.root, typography.text, typography.sm, className)}
      aria-live='polite'
      {...props}
    >
      {children}
    </div>
  )
}
