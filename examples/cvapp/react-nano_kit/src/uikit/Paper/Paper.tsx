import type {
  Ref,
  HTMLAttributes
} from 'react'
import cx from 'clsx'
import typography from '../typography.module.css'
import styles from './Paper.module.css'

export interface PaperProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'aside'
  color?: 'success'
  ref?: Ref<HTMLDivElement>
}

export function Paper({
  as: Component = 'div',
  className,
  color,
  children,
  ...props
}: PaperProps) {
  return (
    <Component
      className={cx(
        styles.root,
        styles[color!],
        typography.text,
        typography.lg,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
