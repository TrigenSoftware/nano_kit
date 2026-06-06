import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useMemo
} from 'react'
import cx from 'clsx'
import mixins from '../mixins.module.css'
import styles from './LetterCard.module.css'

export interface LetterCardContentProps extends HTMLAttributes<HTMLDivElement> {
  placeholder?: ReactNode
  value?: string
  maxLines?: number
}

export function LetterCardContent({
  className,
  value,
  placeholder,
  maxLines,
  style,
  ...props
}: LetterCardContentProps) {
  const formattedValue = useMemo(() => {
    if (!value) {
      return placeholder
    }

    return value.split('\n').flatMap((line, index, array) => (
      index < array.length - 1
        // oxlint-disable-next-line react/no-array-index-key
        ? [line, <br key={index}/>]
        : line
    ))
  }, [value, placeholder])

  return (
    <div
      className={cx(
        styles.content,
        maxLines && styles.maxLines,
        mixins.focusOutline,
        className
      )}
      style={maxLines
        ? {
          ...style,
          '--countLinesMax': maxLines
        } as CSSProperties
        : style}
      {...props}
    >
      {formattedValue}
    </div>
  )
}
