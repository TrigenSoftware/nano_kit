/* DISCLAIMER! VIBECODED! */
import { usePaths } from '@nano_kit/react-router'
import { type Location } from '#src/services/api'
import styles from './LocationCard.module.css'

export interface LocationCardProps {
  location: Location
}

export function LocationCard({ location }: LocationCardProps) {
  const paths = usePaths()
  const locationUrl = paths.location({
    id: location.id
  })

  return (
    <article className={styles.card}>
      <a href={locationUrl} className={styles.link}>
        <div className={styles.content}>
          <h2 className={styles.name}>{location.name}</h2>

          <div className={styles.info}>
            <div className={styles.row}>
              <span className={styles.label}>Type:</span>
              <span className={styles.value}>{location.type}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Dimension:</span>
              <span className={styles.value}>{location.dimension}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Residents:</span>
              <span className={styles.value}>{location.residents.length}</span>
            </div>
          </div>
        </div>
      </a>
    </article>
  )
}
