import type {
  FormHTMLAttributes,
  Ref
} from 'react'
import cx from 'clsx'
import styles from './Form.module.css'

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  ref?: Ref<HTMLFormElement>
}

export function Form({
  className,
  children,
  ref,
  ...props
}: FormProps) {
  return (
    <form
      ref={ref}
      className={cx(
        styles.root,
        className
      )}
      {...props}
    >
      {children}
    </form>
  )
}
