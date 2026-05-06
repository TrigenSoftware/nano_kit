/* DISCLAIMER! VIBECODED! */
import {
  useSignal,
  useInject
} from '@nano_kit/react'
import { Episode$ } from '#src/stores/episodes'

export function EpisodeDetail() {
  const { $episode } = useInject(Episode$)
  const episode = useSignal($episode)

  if (!episode) {
    return null
  }

  return (
    <div className='episode-detail-container'>
      <div className='episode-detail-header'>
        <div className='episode-detail-info'>
          <h1 className='episode-detail-name'>{episode.name}</h1>
          <div className='episode-detail-episode'>
            <span className='episode-detail-label'>Episode:</span>
            <span className='episode-detail-value'>{episode.episode}</span>
          </div>
          <div className='episode-detail-air-date'>
            <span className='episode-detail-label'>Air Date:</span>
            <span className='episode-detail-value'>{episode.air_date}</span>
          </div>
        </div>
      </div>

      <div className='episode-detail-details'>
        <div className='episode-detail-section'>
          <h2>Created</h2>
          <p>{new Date(episode.created).toLocaleDateString()}</p>
        </div>

        <div className='episode-detail-section'>
          <h2>URL</h2>
          <p>Episode #{episode.id}</p>
        </div>
      </div>
    </div>
  )
}
