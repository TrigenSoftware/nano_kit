/* DISCLAIMER! VIBECODED! */
'use client'
import type { Episode } from '@/services/api'
import { EpisodeCard } from '@/ui/blocks/EpisodeCard'

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
