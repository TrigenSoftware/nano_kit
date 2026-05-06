/* DISCLAIMER! VIBECODED! */
import { useParams } from '@tanstack/react-router'
import { useLocation } from '#src/stores/locations'
import { useLocationResidents } from '#src/stores/characters'
import { LocationDetail } from '#src/ui/blocks/LocationDetail'
import { CharactersGrid } from '#src/ui/blocks/CharactersGrid'
import { Spinner } from '#src/ui/components/Spinner'

export function Location() {
  const { locationId } = useParams({
    from: '/location/$locationId'
  })
  const {
    data: location,
    error: locationError,
    isLoading: locationLoading
  } = useLocation(locationId)
  const {
    data: residents,
    error: residentsError,
    isLoading: residentsLoading
  } = useLocationResidents(locationId)
  const error = locationError || residentsError

  if (error) {
    return (
      <div className='location-error'>
        <h2>Error loading location</h2>
        <p>{error.message}</p>
      </div>
    )
  }

  if (locationLoading || residentsLoading || !location || !residents) {
    return <Spinner>Loading location...</Spinner>
  }

  return (
    <section className='location-container'>
      <LocationDetail location={location} />

      <div className='location-residents-section'>
        <h2 id='residents' className='location-residents-title'>
          <a href='#residents'>Residents ({residents.length})</a>
        </h2>
        <CharactersGrid characters={residents} />
      </div>
    </section>
  )
}
