/* DISCLAIMER! VIBECODED! */
import type { Location } from '#src/services/api'
import styles from './LocationDetail.module.css'

export interface LocationDetailProps {
  location: Location
}

export function LocationDetail({ location }: LocationDetailProps) {
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
