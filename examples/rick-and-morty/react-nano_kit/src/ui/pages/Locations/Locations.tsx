/* DISCLAIMER! VIBECODED! */
import { useSignal } from '@nano_kit/react'
import { $locationsPage } from '#src/stores/router'
import {
  $locations,
  $locationsError,
  $locationsLoading
} from '#src/stores/locations'
import { LocationsGrid } from '#src/ui/blocks/LocationsGrid'
import { Pagination } from '#src/ui/components/Pagination'
import { Spinner } from '#src/ui/components/Spinner'
import styles from './Locations.module.css'

function formatUrl(page: number) {
  return `?page=${page}`
}

function formatPageLabel(page: number) {
  return `Go to page ${page}`
}

export function Locations() {
  const locationsPage = useSignal($locations)
  const currentPage = useSignal($locationsPage)
  const error = useSignal($locationsError)
  const loading = useSignal($locationsLoading)

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
          <p>{error}</p>
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
          current={currentPage}
          total={totalPages}
          formatUrl={formatUrl}
          previousLabel='Previous'
          nextLabel='Next'
          formatPageLabel={formatPageLabel}
          label='Location pages navigation'
        />
      )}
    </section>
  )
}
