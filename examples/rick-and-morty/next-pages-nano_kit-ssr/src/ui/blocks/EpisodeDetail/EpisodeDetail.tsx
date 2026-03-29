/* DISCLAIMER! VIBECODED! */
'use client'
import {
  useSignal,
  useInject
} from '@nano_kit/react'
import { Episode$ } from '@/stores/episodes'
import styles from './EpisodeDetail.module.css'

export function EpisodeDetail() {
  const { $episode } = useInject(Episode$)
  const episode = useSignal($episode)

  if (!episode) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.info}>
          <h1 className={styles.name}>{episode.name}</h1>
          <div className={styles.episode}>
            <span className={styles.label}>Episode:</span>
            <span className={styles.value}>{episode.episode}</span>
          </div>
          <div className={styles.airDate}>
            <span className={styles.label}>Air Date:</span>
            <span className={styles.value}>{episode.air_date}</span>
          </div>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.section}>
          <h2>Created</h2>
          <p>{new Date(episode.created).toLocaleDateString()}</p>
        </div>

        <div className={styles.section}>
          <h2>URL</h2>
          <p>Episode #{episode.id}</p>
        </div>
      </div>
    </div>
  )
}
