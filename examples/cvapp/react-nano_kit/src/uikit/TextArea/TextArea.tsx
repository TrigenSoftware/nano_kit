import {
  type ChangeEvent,
  type TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useRef
} from 'react'
import cx from 'clsx'
import typography from '../typography.module.css'
import mixins from '../mixins.module.css'
import styles from './TextArea.module.css'

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string
}

export function TextArea({
  className,
  maxLength,
  onChange,
  value,
  ...props
}: TextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const validateLength = useCallback((element: HTMLTextAreaElement | null, value: string | undefined) => {
    if (maxLength === undefined || !element || value === undefined) {
      return
    }

    element.setCustomValidity(
      value.length > maxLength ? `Maximum length is ${maxLength} characters` : ''
    )
  }, [maxLength])
  const onChangeCallback = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    validateLength(event.target, event.target.value)
    onChange?.(event)
  }, [validateLength, onChange])

  useEffect(() => {
    validateLength(textareaRef.current, value)
  }, [validateLength, value])

  return (
    <textarea
      ref={textareaRef}
      className={cx(
        styles.root,
        typography.text,
        typography.md,
        mixins.focusOutline,
        className
      )}
      onChange={onChangeCallback}
      value={value}
      {...props}
    />
  )
}
