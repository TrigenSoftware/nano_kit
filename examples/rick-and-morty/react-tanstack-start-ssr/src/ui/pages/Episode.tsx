/* DISCLAIMER! VIBECODED! */
import { useParams } from '@tanstack/react-router'
import { useEpisode } from '#src/stores/episodes'
import { useEpisodeCharacters } from '#src/stores/characters'
import { EpisodeDetail } from '#src/ui/blocks/EpisodeDetail'
import { CharactersGrid } from '#src/ui/blocks/CharactersGrid'
import { Spinner } from '#src/ui/components/Spinner'

export function Episode() {
  const { episodeId } = useParams({
    from: '/episode/$episodeId'
  })
  const {
    data: episode,
    error: episodeError,
    isLoading: episodeLoading
  } = useEpisode(episodeId)
  const {
    data: characters,
    error: charactersError,
    isLoading: charactersLoading
  } = useEpisodeCharacters(episodeId)
  const error = episodeError || charactersError

  if (error) {
    return (
      <div className='episode-error'>
        <h2>Error loading episode</h2>
        <p>{error.message}</p>
      </div>
    )
  }

  if (episodeLoading || charactersLoading || !episode || !characters) {
    return <Spinner>Loading episode...</Spinner>
  }

  return (
    <section className='episode-container'>
      <EpisodeDetail episode={episode} />

      <div className='episode-characters-section'>
        <h2 id='characters' className='episode-characters-title'>
          <a href='#characters'>Characters ({characters.length})</a>
        </h2>
        <CharactersGrid characters={characters} />
      </div>
    </section>
  )
}
