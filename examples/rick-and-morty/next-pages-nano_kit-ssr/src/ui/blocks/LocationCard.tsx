/* DISCLAIMER! VIBECODED! */
'use client'
import { useInject } from '@nano_kit/react'
import { Paths$ } from '@nano_kit/router'
import type { Location } from '@/services/api'

export interface LocationCardProps {
  location: Location
}

export function LocationCard({ location }: LocationCardProps) {
  const paths = useInject(Paths$)
  const locationUrl = paths.location({
    id: location.id
  })

  return (
    <article className='location-card-card'>
      <a href={locationUrl} className='location-card-link'>
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
      </a>
    </article>
  )
}
