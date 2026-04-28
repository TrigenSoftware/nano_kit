/* DISCLAIMER! VIBECODED! */
import { useParams } from '@tanstack/react-router'
import { idsFromUrls } from '#src/services/api'
import { useEpisode } from '#src/stores/episodes'
import { useResidents } from '#src/stores/characters'
import { EpisodeDetail } from '#src/ui/blocks/EpisodeDetail'
import { CharactersGrid } from '#src/ui/blocks/CharactersGrid'
import { Spinner } from '#src/ui/components/Spinner'
import styles from './Episode.module.css'

export function Episode() {
  const { episodeId } = useParams({
    from: '/episode/$episodeId'
  })
  const {
    data: episode,
    error: episodeError,
    isLoading: episodeLoading
  } = useEpisode(episodeId)
  const ids = episode ? idsFromUrls(episode.characters) : []
  const {
    data: characters,
    error: charactersError,
    isLoading: charactersLoading
  } = useResidents(ids)
  const error = episodeError || charactersError

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Error loading episode</h2>
        <p>{error.message}</p>
      </div>
    )
  }

  if (episodeLoading || charactersLoading || !episode || !characters) {
    return <Spinner>Loading episode...</Spinner>
  }

  return (
    <section className={styles.container}>
      <EpisodeDetail episode={episode} />

      <div className={styles.charactersSection}>
        <h2 id='characters' className={styles.charactersTitle}>
          <a href='#characters'>Characters ({characters.length})</a>
        </h2>
        <CharactersGrid characters={characters} />
      </div>
    </section>
  )
}
