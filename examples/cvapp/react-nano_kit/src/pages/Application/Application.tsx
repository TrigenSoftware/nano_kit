import {
  useCallback,
  useRef
} from 'react'
import { ApplicationForm } from '~/blocks/ApplicationForm'
import { ApplicationLetter } from '~/blocks/ApplicationLetter'
import styles from './Application.module.css'

const VIRTUAL_KEYBOARD_HIDE_TIMEOUT = 800

export function Application() {
  const letterRef = useRef<HTMLDivElement>(null)
  const onSubmitCallback = useCallback(() => {
    setTimeout(() => {
      letterRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }, VIRTUAL_KEYBOARD_HIDE_TIMEOUT)
  }, [])

  return (
    <section className={styles.root}>
      <ApplicationForm onSubmit={onSubmitCallback}/>
      <ApplicationLetter ref={letterRef}/>
    </section>
  )
}
