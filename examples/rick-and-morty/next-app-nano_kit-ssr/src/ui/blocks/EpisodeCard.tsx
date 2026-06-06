/* DISCLAIMER! VIBECODED! */
'use client'
import { Link } from '@nano_kit/next-router'
import type { Episode } from '@/services/api'

export interface EpisodeCardProps {
  episode: Episode
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  return (
    <article className='episode-card-card'>
      <Link
        className='episode-card-link'
        to='episode'
        params={{
          id: episode.id
        }}
      >
        <div className='episode-card-content'>
          <h2 className='episode-card-name'>{episode.name}</h2>

          <div className='episode-card-info'>
            <div className='episode-card-row'>
              <span className='episode-card-label'>Episode:</span>
              <span className='episode-card-value'>{episode.episode}</span>
            </div>

            <div className='episode-card-row'>
              <span className='episode-card-label'>Air Date:</span>
              <span className='episode-card-value'>{episode.air_date}</span>
            </div>

            <div className='episode-card-row'>
              <span className='episode-card-label'>Characters:</span>
              <span className='episode-card-value'>{episode.characters.length}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
