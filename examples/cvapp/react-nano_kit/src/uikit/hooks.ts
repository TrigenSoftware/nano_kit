import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

/**
 * Monitors the validity of a form element by calling its checkValidity method.
 * @param formRef - A ref object pointing to the form element to monitor.
 * @returns Whether the form is currently valid.
 */
export function useFormValidity(formRef: RefObject<HTMLFormElement | null>): boolean {
  const [valid, setValid] = useState(false)
  const checkValidityRef = useRef<() => void>(null)

  useEffect(() => {
    const form = formRef.current

    if (!form) {
      return undefined
    }

    let timer: ReturnType<typeof setTimeout>
    const checkValidity = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setValid(form.checkValidity()))
    }

    checkValidityRef.current = checkValidity

    checkValidity()

    form.addEventListener('input', checkValidity)

    return () => {
      clearTimeout(timer)
      form.removeEventListener('input', checkValidity)
    }
  }, [])

  useEffect(() => {
    checkValidityRef.current?.()
  })

  return valid
}

/**
 * Shows the given text for a specified duration, then hides it.
 * @param text - The text to show.
 * @param duration - The duration in milliseconds to show the text.
 * @returns The current text (or undefined if hidden) and a function to trigger the blink.
 */
export function useTextBlink(text: string, duration: number) {
  const [currentText, setCurrentText] = useState<string | undefined>(undefined)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const blink = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setCurrentText(text)

    timeoutRef.current = setTimeout(() => {
      setCurrentText(undefined)
      timeoutRef.current = null
    }, duration)
  }, [text, duration])

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    },
    []
  )

  return [currentText, blink] as const
}
