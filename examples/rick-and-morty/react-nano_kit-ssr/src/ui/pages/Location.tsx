/* DISCLAIMER! VIBECODED! */
import {
  useSignal,
  useInject
} from '@nano_kit/react'
import {
  computed,
  inject
} from '@nano_kit/store'
import { title } from '@nano_kit/router'
import { Location$ } from '#src/stores/locations'
import { Residents$ } from '#src/stores/characters'
import { LocationDetail } from '#src/ui/blocks/LocationDetail'
import { CharactersGrid } from '#src/ui/blocks/CharactersGrid'
import { Spinner } from '#src/ui/components/Spinner'

export function Head$() {
  const { $location } = inject(Location$)

  return [
    title(computed(() => `${$location()?.name || 'Location'} | Rick and Morty Wiki`))
  ]
}

export function Stores$() {
  const { $location } = inject(Location$)
  const { $residents } = inject(Residents$)

  return [$location, $residents]
}

export default function Location() {
  const {
    $locationError,
    $locationLoading
  } = useInject(Location$)
  const { $residents } = useInject(Residents$)
  const residents = useSignal($residents)
  const error = useSignal($locationError)
  const loading = useSignal($locationLoading)

  if (error) {
    return (
      <div className='location-error'>
        <h2>Error loading location</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (loading || !residents) {
    return <Spinner>Loading location...</Spinner>
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
