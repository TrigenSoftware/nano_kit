/* DISCLAIMER! VIBECODED! */
'use client'
import { type Episode } from '@/services/api'
import { EpisodeCard } from '@/ui/blocks/EpisodeCard'
import styles from './EpisodesGrid.module.css'

export interface EpisodesGridProps {
  episodes: Episode[]
}

export function EpisodesGrid({ episodes }: EpisodesGridProps) {
  return (
    <div className={styles.grid}>
      {episodes.map(episode => (
        <EpisodeCard
          key={episode.id}
          episode={episode}
        />
      ))}
    </div>
  )
}
