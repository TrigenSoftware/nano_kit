import type {
  JSX,
  ReactNode
} from 'react'
import cx from 'clsx'
import type {
  ElementType,
  AsElementProps
} from '../types'
import typography from '../typography.module.css'
import mixins from '../mixins.module.css'
import styles from './Button.module.css'

interface BaseButtonProps {
  variant?: 'default' | 'primary' | 'subtle'
  size?: 'sm' | 'md' | 'lg'
  color?: 'danger'
  disabled?: boolean
  block?: boolean
  icon?: ReactNode
  iconAlign?: 'left' | 'right'
}

export type ButtonProps<T extends ElementType = 'button'> = BaseButtonProps & AsElementProps<T>

export function Button<T extends ElementType = 'button'>(props: ButtonProps<T>): JSX.Element

export function Button({
  as: Component = 'button',
  className,
  variant = 'default',
  size = 'md',
  color,
  block = false,
  icon,
  iconAlign = 'left',
  children,
  ...props
}: ButtonProps) {
  return (
    <Component
      className={cx(
        styles.root,
        styles[variant],
        styles[size],
        styles[color!],
        block && styles.block,
        typography.text,
        typography[size],
        mixins.focusOutline,
        className
      )}
      {...props}
    >
      {icon && (
        <span className={cx(styles.icon, styles[iconAlign])}>
          {icon}
        </span>
      )}
      {children && (
        <span>
          {children}
        </span>
      )}
    </Component>
  )
}
