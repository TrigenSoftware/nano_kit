/* DISCLAIMER! VIBECODED! */
import type { Location } from '#src/services/api'
import { Link } from '#src/ui/components/Link'

export interface LocationCardProps {
  location: Location
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <article className='location-card-card'>
      <Link
        to='location'
        params={{
          id: location.id
        }}
        className='location-card-link'
      >
        <div className='location-card-content'>
          <h2 className='location-card-name'>{location.name}</h2>

          <div className='location-card-info'>
            <div className='location-card-row'>
              <span className='location-card-label'>Type:</span>
              <span className='location-card-value'>{location.type}</span>
            </div>

            <div className='location-card-row'>
              <span className='location-card-label'>Dimension:</span>
              <span className='location-card-value'>{location.dimension}</span>
            </div>

            <div className='location-card-row'>
              <span className='location-card-label'>Residents:</span>
              <span className='location-card-value'>{location.residents.length}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
