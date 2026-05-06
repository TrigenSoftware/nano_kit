/* DISCLAIMER! VIBECODED! */
'use client'
import {
  useSignal,
  useInject
} from '@nano_kit/react'
import { Character$ } from '@/stores/characters'
import { CharacterEpisodes$ } from '@/stores/episodes'
import { CharacterDetail } from '@/ui/blocks/CharacterDetail'
import { EpisodesGrid } from '@/ui/blocks/EpisodesGrid'
import { Spinner } from '@/ui/components/Spinner'

export default function Character() {
  const {
    $characterError,
    $characterLoading
  } = useInject(Character$)
  const { $characterEpisodes } = useInject(CharacterEpisodes$)
  const episodes = useSignal($characterEpisodes)
  const error = useSignal($characterError)
  const loading = useSignal($characterLoading)

  if (error) {
    return (
      <div className='character-error'>
        <h2>Error loading character</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (loading || !episodes) {
    return <Spinner>Loading character...</Spinner>
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
