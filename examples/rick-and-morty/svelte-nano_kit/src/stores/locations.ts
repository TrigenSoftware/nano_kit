import { queryKey } from '@nano_kit/query'
import {
  type Location,
  getLocation,
  getLocations
} from '#src/services/api'
import { OK_STATUS } from '#src/common/constants'
import {
  type Page,
  query
} from './query'
import {
  $locationId,
  $locationsPage
} from './router'

export const [
  $locations,
  $locationsError,
  $locationsLoading
] = query<[page: number], Page<Location>>(
  queryKey('locations'),
  [$locationsPage],
  async (page) => {
    if (page === 0) {
      return {
        items: [],
        totalPages: 0
      }
    }

    const response = await getLocations({
      page
    })

    if (response.status === OK_STATUS && response.data.results && response.data.info) {
      return {
        items: response.data.results,
        totalPages: response.data.info.pages
      }
    }

    throw new Error(response.statusMessage)
  }
)

export const [
  $location,
  $locationError,
  $locationLoading
] = query<[id: number | null], Location | null>(
  queryKey('location'),
  [$locationId],
  async (id) => {
    if (id === null) {
      return null
    }

    const response = await getLocation(id)

    if (response.status === OK_STATUS && response.data) {
      return response.data
    }

    throw new Error(response.statusMessage)
  }
)
