/* DISCLAIMER! VIBECODED! */
import { useSignal } from '@nano_kit/react'
import {
  $characterEpisodes,
  $characterEpisodesError,
  $characterEpisodesLoading
} from '#src/stores/episodes'
import { CharacterDetail } from '#src/ui/blocks/CharacterDetail'
import { EpisodesGrid } from '#src/ui/blocks/EpisodesGrid'
import { Spinner } from '#src/ui/components/Spinner'

export default function Character() {
  const episodes = useSignal($characterEpisodes)
  const error = useSignal($characterEpisodesError)
  const loading = useSignal($characterEpisodesLoading)

  if (loading || !episodes) {
    return <Spinner>Loading character...</Spinner>
  }

  if (error) {
    return (
      <div className='character-error'>
        <h2>Error loading character</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <section className='character-container'>
      <CharacterDetail />

      <div className='character-episodes-section'>
        <h2 id='episodes' className='character-episodes-title'>
          <a href='#episodes'>Episodes ({episodes.length})</a>
        </h2>
        <EpisodesGrid episodes={episodes} />
      </div>
    </section>
  )
}
