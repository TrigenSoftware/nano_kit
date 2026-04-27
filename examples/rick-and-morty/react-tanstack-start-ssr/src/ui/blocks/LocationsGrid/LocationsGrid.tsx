/* DISCLAIMER! VIBECODED! */
import { type Location } from '#src/services/api'
import { LocationCard } from '#src/ui/blocks/LocationCard'
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
