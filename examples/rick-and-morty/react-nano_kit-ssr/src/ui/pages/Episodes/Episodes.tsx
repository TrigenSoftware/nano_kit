/* DISCLAIMER! VIBECODED! */
import {
  useSignal,
  useInject
} from '@nano_kit/react'
import { inject } from '@nano_kit/store'
import { title } from '@nano_kit/router'
import { Params$ } from '#src/stores/router'
import { Episodes$ } from '#src/stores/episodes'
import { EpisodesGrid } from '#src/ui/blocks/EpisodesGrid'
import { Pagination } from '#src/ui/components/Pagination'
import { Spinner } from '#src/ui/components/Spinner'
import styles from './Episodes.module.css'

export function Head$() {
  return [
    title('Rick and Morty Wiki | Episodes')
  ]
}

export function Stores$() {
  const { $episodes } = inject(Episodes$)

  return [$episodes]
}

function formatUrl(page: number) {
  return `?page=${page}`
}

function formatPageLabel(page: number) {
  return `Go to page ${page}`
}

export default function Episodes() {
  const { $episodesPage } = useInject(Params$)
  const {
    $episodes,
    $episodesError,
    $episodesLoading
  } = useInject(Episodes$)
  const episodesPage = useSignal($episodes)
  const error = useSignal($episodesError)
  const loading = useSignal($episodesLoading)
  const currentPage = useSignal($episodesPage)

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

  if (loading || !episodesPage) {
    return (
      <section className={styles.container}>
        <Spinner>Loading episodes...</Spinner>
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
