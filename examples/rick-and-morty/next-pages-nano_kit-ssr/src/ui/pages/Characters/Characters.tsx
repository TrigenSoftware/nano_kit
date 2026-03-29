/* DISCLAIMER! VIBECODED! */
'use client'
import {
  useSignal,
  useInject
} from '@nano_kit/react'
import { Params$ } from '@/stores/router'
import { Characters$ } from '@/stores/characters'
import { CharactersGrid } from '@/ui/blocks/CharactersGrid'
import { Pagination } from '@/ui/components/Pagination'
import { Spinner } from '@/ui/components/Spinner'
import styles from './Characters.module.css'

function formatUrl(page: number) {
  return `?page=${page}`
}

function formatPageLabel(page: number) {
  return `Go to page ${page}`
}

export default function Characters() {
  const { $charactersPage } = useInject(Params$)
  const {
    $characters,
    $charactersError,
    $charactersLoading
  } = useInject(Characters$)
  const charactersPage = useSignal($characters)
  const error = useSignal($charactersError)
  const loading = useSignal($charactersLoading)
  const currentPage = useSignal($charactersPage)

  if (error) {
    return (
      <section className={styles.container}>
        <div className={styles.error}>
          <h2>Error loading characters</h2>
          <p>{error}</p>
        </div>
      </section>
    )
  }

  if (loading || !charactersPage) {
    return (
      <section className={styles.container}>
        <Spinner>Loading characters...</Spinner>
      </section>
    )
  }

  const {
    items: characters,
    totalPages
  } = charactersPage

  return (
    <section className={styles.container}>
      <CharactersGrid characters={characters} />

      {totalPages > 1 && (
        <Pagination
          current={currentPage}
          total={totalPages}
          formatUrl={formatUrl}
          previousLabel='Previous'
          nextLabel='Next'
          formatPageLabel={formatPageLabel}
          label='Character pages navigation'
        />
      )}
    </section>
  )
}
