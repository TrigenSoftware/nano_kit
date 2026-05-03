/* DISCLAIMER! VIBECODED! */
'use client'
import {
  useSignal,
  useInject
} from '@nano_kit/react'
import { Episode$ } from '@/stores/episodes'
import { Residents$ } from '@/stores/characters'
import { EpisodeDetail } from '@/ui/blocks/EpisodeDetail'
import { CharactersGrid } from '@/ui/blocks/CharactersGrid'
import { Spinner } from '@/ui/components/Spinner'

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
