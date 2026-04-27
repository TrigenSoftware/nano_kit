/* DISCLAIMER! VIBECODED! */
import { useSearch } from '@tanstack/react-router'
import { useEpisodes } from '#src/stores/episodes'
import { EpisodesGrid } from '#src/ui/blocks/EpisodesGrid'
import { Pagination } from '#src/ui/components/Pagination'
import { Spinner } from '#src/ui/components/Spinner'
import styles from './Episodes.module.css'

function formatPageLabel(page: number) {
  return `Go to page ${page}`
}

export function Episodes() {
  const { page } = useSearch({
    from: '/episodes'
  })
  const { data: episodesPage, error, isLoading: loading } = useEpisodes(page)

  if (loading || !episodesPage) {
    return (
      <section className={styles.container}>
        <Spinner>Loading episodes...</Spinner>
      </section>
    )
  }

  if (error) {
    return (
      <section className={styles.container}>
        <div className={styles.error}>
          <h2>Error loading episodes</h2>
          <p>{error.message}</p>
        </div>
      </section>
    )
  }

  const {
    items: episodes,
    totalPages
  } = episodesPage

  return (
    <section className={styles.container}>
      <EpisodesGrid episodes={episodes} />

      {totalPages > 1 && (
        <Pagination
          current={page}
          total={totalPages}
          to='/episodes'
          previousLabel='Previous'
          nextLabel='Next'
          formatPageLabel={formatPageLabel}
          label='Episode pages navigation'
        />
      )}
    </section>
  )
}
