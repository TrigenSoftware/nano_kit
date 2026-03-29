/* DISCLAIMER! VIBECODED! */
'use client'
import {
  useSignal,
  useInject
} from '@nano_kit/react'
import { Params$ } from '@/stores/router'
import { Locations$ } from '@/stores/locations'
import { LocationsGrid } from '@/ui/blocks/LocationsGrid'
import { Pagination } from '@/ui/components/Pagination'
import { Spinner } from '@/ui/components/Spinner'
import styles from './Locations.module.css'

function formatUrl(page: number) {
  return `?page=${page}`
}

function formatPageLabel(page: number) {
  return `Go to page ${page}`
}

export default function Locations() {
  const { $locationsPage } = useInject(Params$)
  const {
    $locations,
    $locationsError,
    $locationsLoading
  } = useInject(Locations$)
  const locationsPage = useSignal($locations)
  const currentPage = useSignal($locationsPage)
  const error = useSignal($locationsError)
  const loading = useSignal($locationsLoading)

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

  if (loading || !locationsPage) {
    return (
      <section className={styles.container}>
        <Spinner>Loading locations...</Spinner>
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
