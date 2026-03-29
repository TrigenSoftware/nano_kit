/* DISCLAIMER! VIBECODED! */
'use client'
import {
  useSignal,
  useInject
} from '@nano_kit/react'
import { Location$ } from '@/stores/locations'
import styles from './LocationDetail.module.css'

export function LocationDetail() {
  const { $location } = useInject(Location$)
  const location = useSignal($location)

  if (!location) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.info}>
          <h1 className={styles.name}>{location.name}</h1>
          <div className={styles.type}>
            <span className={styles.label}>Type:</span>
            <span className={styles.value}>{location.type}</span>
          </div>
          <div className={styles.dimension}>
            <span className={styles.label}>Dimension:</span>
            <span className={styles.value}>{location.dimension}</span>
          </div>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.section}>
          <h2>Created</h2>
          <p>{new Date(location.created).toLocaleDateString()}</p>
        </div>

        <div className={styles.section}>
          <h2>URL</h2>
          <p>Location #{location.id}</p>
        </div>
      </div>
    </div>
  )
}
