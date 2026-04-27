import styles from './Spinner.module.css'

export interface SpinnerProps {
  children: React.ReactNode
}

export function Spinner({ children }: SpinnerProps) {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      {children}
    </div>
  )
}
