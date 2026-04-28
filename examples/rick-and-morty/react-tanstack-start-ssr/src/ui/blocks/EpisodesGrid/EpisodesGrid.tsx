/* DISCLAIMER! VIBECODED! */
import { type Episode } from '#src/services/api'
import { EpisodeCard } from '#src/ui/blocks/EpisodeCard'
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
