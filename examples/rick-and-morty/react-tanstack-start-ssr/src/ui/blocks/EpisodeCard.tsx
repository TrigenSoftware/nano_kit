/* DISCLAIMER! VIBECODED! */
import { Link } from '@tanstack/react-router'
import type { Episode } from '#src/services/api'

export interface EpisodeCardProps {
  episode: Episode
}

export function EpisodeCard({ episode }: EpisodeCardProps) {
  return (
    <article className='episode-card-card'>
      <Link to='/episode/$episodeId' params={{
        episodeId: episode.id
      }} className='episode-card-link'>
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
