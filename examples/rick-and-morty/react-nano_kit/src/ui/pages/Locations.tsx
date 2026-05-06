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

function formatUrl(page: number) {
  return `?page=${page}`
}

function formatPageLabel(page: number) {
  return `Go to page ${page}`
}

export default function Locations() {
  const locationsPage = useSignal($locations)
  const currentPage = useSignal($locationsPage)
  const error = useSignal($locationsError)
  const loading = useSignal($locationsLoading)

  if (loading || !locationsPage) {
    return (
      <section className='locations-container'>
        <Spinner>Loading locations...</Spinner>
      </section>
    )
  }

  if (error) {
    return (
      <section className='locations-container'>
        <div className='locations-error'>
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
    <section className='locations-container'>
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
