/* DISCLAIMER! VIBECODED! */
import type { Location } from '#src/services/api'

export interface LocationDetailProps {
  location: Location
}

export function LocationDetail({ location }: LocationDetailProps) {
  return (
    <div className='location-detail-container'>
      <div className='location-detail-header'>
        <div className='location-detail-info'>
          <h1 className='location-detail-name'>{location.name}</h1>
          <div className='location-detail-type'>
            <span className='location-detail-label'>Type:</span>
            <span className='location-detail-value'>{location.type}</span>
          </div>
          <div className='location-detail-dimension'>
            <span className='location-detail-label'>Dimension:</span>
            <span className='location-detail-value'>{location.dimension}</span>
          </div>
        </div>
      </div>

      <div className='location-detail-details'>
        <div className='location-detail-section'>
          <h2>Created</h2>
          <p>{new Date(location.created).toLocaleDateString()}</p>
        </div>

        <div className='location-detail-section'>
          <h2>URL</h2>
          <p>Location #{location.id}</p>
        </div>
      </div>
    </div>
  )
}
