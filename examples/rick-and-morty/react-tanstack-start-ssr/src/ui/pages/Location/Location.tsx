/* DISCLAIMER! VIBECODED! */
import { useParams } from '@tanstack/react-router'
import { idsFromUrls } from '#src/services/api'
import { useLocation } from '#src/stores/locations'
import { useResidents } from '#src/stores/characters'
import { LocationDetail } from '#src/ui/blocks/LocationDetail'
import { CharactersGrid } from '#src/ui/blocks/CharactersGrid'
import { Spinner } from '#src/ui/components/Spinner'
import styles from './Location.module.css'

export function Location() {
  const { locationId } = useParams({
    from: '/location/$locationId'
  })
  const {
    data: location,
    error: locationError,
    isLoading: locationLoading
  } = useLocation(locationId)
  const ids = location ? idsFromUrls(location.residents) : []
  const {
    data: residents,
    error: residentsError,
    isLoading: residentsLoading
  } = useResidents(ids)
  const error = locationError || residentsError

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Error loading location</h2>
        <p>{error.message}</p>
      </div>
    )
  }

  if (locationLoading || residentsLoading || !location || !residents) {
    return <Spinner>Loading location...</Spinner>
  }

  return (
    <section className={styles.container}>
      <LocationDetail location={location} />

      <div className={styles.residentsSection}>
        <h2 id='residents' className={styles.residentsTitle}>
          <a href='#residents'>Residents ({residents.length})</a>
        </h2>
        <CharactersGrid characters={residents} />
      </div>
    </section>
  )
}
