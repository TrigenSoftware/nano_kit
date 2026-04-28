/* DISCLAIMER! VIBECODED! */
import { useSearch } from '@tanstack/react-router'
import { useCharacters } from '#src/stores/characters'
import { CharactersGrid } from '#src/ui/blocks/CharactersGrid'
import { Pagination } from '#src/ui/components/Pagination'
import { Spinner } from '#src/ui/components/Spinner'
import styles from './Characters.module.css'

function formatPageLabel(page: number) {
  return `Go to page ${page}`
}

export function Characters() {
  const { page } = useSearch({
    from: '/characters'
  })
  const { data: charactersPage, error, isLoading: loading } = useCharacters(page)

  if (loading || !charactersPage) {
    return (
      <section className={styles.container}>
        <Spinner>Loading characters...</Spinner>
      </section>
    )
  }

  if (error) {
    return (
      <section className={styles.container}>
        <div className={styles.error}>
          <h2>Error loading characters</h2>
          <p>{error.message}</p>
        </div>
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
          current={page}
          total={totalPages}
          to='/characters'
          previousLabel='Previous'
          nextLabel='Next'
          formatPageLabel={formatPageLabel}
          label='Character pages navigation'
        />
      )}
    </section>
  )
}
