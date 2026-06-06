import type {
  HTMLAttributes,
  ReactNode
} from 'react'
import cx from 'clsx'
import styles from './SubHeader.module.css'

export interface SubHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode
}

export function SubHeader({
  className,
  title,
  children,
  ...props
}: SubHeaderProps) {
  return (
    <header
      className={cx(
        styles.root,
        className
      )}
      {...props}
    >
      {title}
      {children && (
        <div className={styles.actions}>
          {children}
        </div>
      )}
    </header>
  )
}
