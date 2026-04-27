/* DISCLAIMER! VIBECODED! */
import { Link } from '@tanstack/react-router'
import { type Episode } from '#src/services/api'
import styles from './EpisodeCard.module.css'

export interface EpisodeCardProps {
  episode: Episode
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  return (
    <article className={styles.card}>
      <Link to='/episode/$episodeId' params={{
        episodeId: episode.id
      }} className={styles.link}>
        <div className={styles.content}>
          <h2 className={styles.name}>{episode.name}</h2>

          <div className={styles.info}>
            <div className={styles.row}>
              <span className={styles.label}>Episode:</span>
              <span className={styles.value}>{episode.episode}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Air Date:</span>
              <span className={styles.value}>{episode.air_date}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Characters:</span>
              <span className={styles.value}>{episode.characters.length}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
