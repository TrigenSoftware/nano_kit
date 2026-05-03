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
import { Episode$ } from '#src/stores/episodes'
import { Residents$ } from '#src/stores/characters'
import { EpisodeDetail } from '#src/ui/blocks/EpisodeDetail'
import { CharactersGrid } from '#src/ui/blocks/CharactersGrid'
import { Spinner } from '#src/ui/components/Spinner'

export function Head$() {
  const { $episode } = inject(Episode$)

  return [
    title(computed(() => `${$episode()?.name || 'Episode'} | Rick and Morty Wiki`))
  ]
}

export function Stores$() {
  const { $episode } = inject(Episode$)
  const { $residents } = inject(Residents$)

  return [$episode, $residents]
}

export default function Episode() {
  const {
    $episodeError,
    $episodeLoading
  } = useInject(Episode$)
  const { $residents } = useInject(Residents$)
  const characters = useSignal($residents)
  const error = useSignal($episodeError)
  const loading = useSignal($episodeLoading)

  if (error) {
    return (
      <div className='episode-error'>
        <h2>Error loading episode</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (loading || !characters) {
    return <Spinner>Loading episode...</Spinner>
  }

  return (
    <section className='episode-container'>
      <EpisodeDetail />

      <div className='episode-characters-section'>
        <h2 id='characters' className='episode-characters-title'>
          <a href='#characters'>Characters ({characters.length})</a>
        </h2>
        <CharactersGrid characters={characters} />
      </div>
    </section>
  )
}
