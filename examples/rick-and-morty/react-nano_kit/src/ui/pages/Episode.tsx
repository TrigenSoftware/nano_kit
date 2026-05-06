/* DISCLAIMER! VIBECODED! */
import { useSignal } from '@nano_kit/react'
import {
  $residents,
  $residentsError,
  $residentsLoading
} from '#src/stores/characters'
import { EpisodeDetail } from '#src/ui/blocks/EpisodeDetail'
import { CharactersGrid } from '#src/ui/blocks/CharactersGrid'
import { Spinner } from '#src/ui/components/Spinner'

export default function Episode() {
  const characters = useSignal($residents)
  const error = useSignal($residentsError)
  const loading = useSignal($residentsLoading)

  if (loading || !characters) {
    return <Spinner>Loading episode...</Spinner>
  }

  if (error) {
    return (
      <div className='episode-error'>
        <h2>Error loading episode</h2>
        <p>{error}</p>
      </div>
    )
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
