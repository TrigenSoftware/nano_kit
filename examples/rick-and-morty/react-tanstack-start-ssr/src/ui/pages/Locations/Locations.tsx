/* DISCLAIMER! VIBECODED! */
import { useSearch } from '@tanstack/react-router'
import { useLocations } from '#src/stores/locations'
import { LocationsGrid } from '#src/ui/blocks/LocationsGrid'
import { Pagination } from '#src/ui/components/Pagination'
import { Spinner } from '#src/ui/components/Spinner'
import styles from './Locations.module.css'

function formatPageLabel(page: number) {
  return `Go to page ${page}`
}

export function Locations() {
  const { page } = useSearch({
    from: '/locations'
  })
  const { data: locationsPage, error, isLoading: loading } = useLocations(page)

  if (loading || !locationsPage) {
    return (
      <section className={styles.container}>
        <Spinner>Loading locations...</Spinner>
      </section>
    )
  }

  if (error) {
    return (
      <section className={styles.container}>
        <div className={styles.error}>
          <h2>Error loading locations</h2>
          <p>{error.message}</p>
        </div>
      </section>
    )
  }

  const {
    items: locations,
    totalPages
  } = locationsPage

  return (
    <section className={styles.container}>
      <LocationsGrid locations={locations} />

      {totalPages > 1 && (
        <Pagination
          current={page}
          total={totalPages}
          to='/locations'
          previousLabel='Previous'
          nextLabel='Next'
          formatPageLabel={formatPageLabel}
          label='Location pages navigation'
        />
      )}
    </section>
  )
}
