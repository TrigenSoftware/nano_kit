/* DISCLAIMER! VIBECODED! */
import { useParams } from '@tanstack/react-router'
import { idsFromUrls } from '#src/services/api'
import { useCharacter } from '#src/stores/characters'
import { useEpisodesByIds } from '#src/stores/episodes'
import { CharacterDetail } from '#src/ui/blocks/CharacterDetail'
import { EpisodesGrid } from '#src/ui/blocks/EpisodesGrid'
import { Spinner } from '#src/ui/components/Spinner'
import styles from './Character.module.css'

export function Character() {
  const { characterId } = useParams({
    from: '/character/$characterId'
  })
  const {
    data: character,
    error: characterError,
    isLoading: characterLoading
  } = useCharacter(characterId)
  const episodeIds = character ? idsFromUrls(character.episode) : []
  const {
    data: episodes,
    error: episodesError,
    isLoading: episodesLoading
  } = useEpisodesByIds(episodeIds)
  const error = characterError || episodesError

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Error loading character</h2>
        <p>{error.message}</p>
      </div>
    )
  }

  if (characterLoading || episodesLoading || !character || !episodes) {
    return <Spinner>Loading character...</Spinner>
  }

  return (
    <section className={styles.container}>
      <CharacterDetail character={character} />

      <div className={styles.episodesSection}>
        <h2 id='episodes' className={styles.episodesTitle}>
          <a href='#episodes'>Episodes ({episodes.length})</a>
        </h2>
        <EpisodesGrid episodes={episodes} />
      </div>
    </section>
  )
}
