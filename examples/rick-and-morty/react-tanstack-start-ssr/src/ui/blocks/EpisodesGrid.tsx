/* DISCLAIMER! VIBECODED! */
import type { Episode } from '#src/services/api'
import { EpisodeCard } from '#src/ui/blocks/EpisodeCard'

export interface EpisodesGridProps {
  episodes: Episode[]
}

export function EpisodesGrid({ episodes }: EpisodesGridProps) {
  return (
    <div className='episodes-grid-grid'>
      {episodes.map(episode => (
        <EpisodeCard
          key={episode.id}
          episode={episode}
        />
      ))}
    </div>
  )
}
