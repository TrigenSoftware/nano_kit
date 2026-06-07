import type {
  HTMLAttributes,
  ReactNode
} from 'react'
import cx from 'clsx'
import typography from '../typography.module.css'
import styles from './FormGroup.module.css'

export interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
  controlId?: string
  label?: ReactNode
  description?: ReactNode
}

export function FormGroup({
  className,
  controlId,
  label,
  description,
  children,
  ...props
}: FormGroupProps) {
  const descriptionId = controlId && description
    ? `${controlId}-description`
    : undefined

  return (
    <div
      className={cx(
        styles.root,
        className
      )}
      {...props}
    >
      {label && (
        <label
          htmlFor={controlId}
          className={cx(
            styles.label,
            typography.text,
            typography.sm
          )}
        >
          {label}
        </label>
      )}
      {children}
      {description && (
        <div
          id={descriptionId}
          className={cx(
            styles.description,
            typography.text,
            typography.sm
          )}
        >
          {description}
        </div>
      )}
    </div>
  )
}
