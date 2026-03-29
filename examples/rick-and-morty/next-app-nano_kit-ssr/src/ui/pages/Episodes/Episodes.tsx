/* DISCLAIMER! VIBECODED! */
'use client'
import {
  useSignal,
  useInject
} from '@nano_kit/react'
import { Params$ } from '@/stores/router'
import { Episodes$ } from '@/stores/episodes'
import { EpisodesGrid } from '@/ui/blocks/EpisodesGrid'
import { Pagination } from '@/ui/components/Pagination'
import { Spinner } from '@/ui/components/Spinner'
import styles from './Episodes.module.css'

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
