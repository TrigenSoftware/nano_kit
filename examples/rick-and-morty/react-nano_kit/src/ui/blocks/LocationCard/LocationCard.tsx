/* DISCLAIMER! VIBECODED! */
import { type Location } from '#src/services/api'
import { Link } from '#src/ui/components/Link'
import styles from './LocationCard.module.css'

export interface LocationCardProps {
  location: Location
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <article className={styles.card}>
      <Link
        to='location'
        params={{
          id: location.id
        }}
        className={styles.link}
      >
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
      </Link>
    </article>
  )
}
