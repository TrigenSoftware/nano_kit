/* DISCLAIMER! VIBECODED! */
import { useParams } from '@tanstack/react-router'
import { useCharacter } from '#src/stores/characters'
import { useCharacterEpisodes } from '#src/stores/episodes'
import { CharacterDetail } from '#src/ui/blocks/CharacterDetail'
import { EpisodesGrid } from '#src/ui/blocks/EpisodesGrid'
import { Spinner } from '#src/ui/components/Spinner'

export function Character() {
  const { characterId } = useParams({
    from: '/character/$characterId'
  })
  const {
    data: character,
    error: characterError,
    isLoading: characterLoading
  } = useCharacter(characterId)
  const {
    data: episodes,
    error: episodesError,
    isLoading: episodesLoading
  } = useCharacterEpisodes(characterId)
  const error = characterError || episodesError

  if (error) {
    return (
      <div className='character-error'>
        <h2>Error loading character</h2>
        <p>{error.message}</p>
      </div>
    )
  }

  if (characterLoading || episodesLoading || !character || !episodes) {
    return <Spinner>Loading character...</Spinner>
  }

  return (
    <section className='character-container'>
      <CharacterDetail character={character} />

      <div className='character-episodes-section'>
        <h2 id='episodes' className='character-episodes-title'>
          <a href='#episodes'>Episodes ({episodes.length})</a>
        </h2>
        <EpisodesGrid episodes={episodes} />
      </div>
    </section>
  )
}
