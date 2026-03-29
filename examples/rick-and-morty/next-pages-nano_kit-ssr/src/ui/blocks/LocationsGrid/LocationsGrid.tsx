/* DISCLAIMER! VIBECODED! */
'use client'
import { type Location } from '@/services/api'
import { LocationCard } from '@/ui/blocks/LocationCard'
import styles from './LocationsGrid.module.css'

export interface LocationsGridProps {
  locations: Location[]
}

export function LocationsGrid({ locations }: LocationsGridProps) {
  return (
    <div className={styles.grid}>
      {locations.map(location => (
        <LocationCard
          key={location.id}
          location={location}
        />
      ))}
    </div>
  )
}
