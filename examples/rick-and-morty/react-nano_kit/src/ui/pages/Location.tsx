/* DISCLAIMER! VIBECODED! */
import { useSignal } from '@nano_kit/react'
import {
  $residents,
  $residentsError,
  $residentsLoading
} from '#src/stores/characters'
import { LocationDetail } from '#src/ui/blocks/LocationDetail'
import { CharactersGrid } from '#src/ui/blocks/CharactersGrid'
import { Spinner } from '#src/ui/components/Spinner'

export default function Location() {
  const residents = useSignal($residents)
  const error = useSignal($residentsError)
  const loading = useSignal($residentsLoading)

  if (loading || !residents) {
    return <Spinner>Loading location...</Spinner>
  }

  if (error) {
    return (
      <div className='location-error'>
        <h2>Error loading location</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <section className='location-container'>
      <LocationDetail />

      <div className='location-residents-section'>
        <h2 id='residents' className='location-residents-title'>
          <a href='#residents'>Residents ({residents.length})</a>
        </h2>
        <CharactersGrid characters={residents} />
      </div>
    </section>
  )
}
