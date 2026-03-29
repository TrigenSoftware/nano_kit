/* DISCLAIMER! VIBECODED! */
import { useSignal } from '@nano_kit/react'
import { $episodesPage } from '#src/stores/router'
import {
  $episodes,
  $episodesError,
  $episodesLoading
} from '#src/stores/episodes'
import { EpisodesGrid } from '#src/ui/blocks/EpisodesGrid'
import { Pagination } from '#src/ui/components/Pagination'
import { Spinner } from '#src/ui/components/Spinner'
import styles from './Episodes.module.css'

function formatUrl(page: number) {
  return `?page=${page}`
}

function formatPageLabel(page: number) {
  return `Go to page ${page}`
}

export function Episodes() {
  const episodesPage = useSignal($episodes)
  const error = useSignal($episodesError)
  const loading = useSignal($episodesLoading)
  const currentPage = useSignal($episodesPage)

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
          <p>{error}</p>
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
          current={currentPage}
          total={totalPages}
          formatUrl={formatUrl}
          previousLabel='Previous'
          nextLabel='Next'
          formatPageLabel={formatPageLabel}
          label='Episode pages navigation'
        />
      )}
    </section>
  )
}
