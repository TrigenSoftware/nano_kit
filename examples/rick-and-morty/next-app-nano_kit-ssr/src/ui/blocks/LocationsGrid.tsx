/* DISCLAIMER! VIBECODED! */
'use client'
import { type Location } from '@/services/api'
import { LocationCard } from '@/ui/blocks/LocationCard'

export interface LocationsGridProps {
  locations: Location[]
}

export function LocationsGrid({ locations }: LocationsGridProps) {
  return (
    <div className='locations-grid-grid'>
      {locations.map(location => (
        <LocationCard
          key={location.id}
          location={location}
        />
      ))}
    </div>
  )
}
