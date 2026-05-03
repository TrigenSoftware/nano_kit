import {
  keepPreviousData,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import {
  type Location,
  getLocation,
  getLocations
} from '../services/api'
import {
  OK_STATUS,
  STALE_TIME
} from '../common/constants'

export interface Page<T> {
  items: T[]
  totalPages: number
}

export function locationsOptions(page: number) {
  return queryOptions({
    queryKey: ['locations', page],
    queryFn: async (): Promise<Page<Location>> => {
      const response = await getLocations({
        page
      })

      if (response.status !== OK_STATUS) {
        throw new Error(response.statusMessage)
      }

      return {
        items: response.data.results ?? [],
        totalPages: response.data.info?.pages ?? 0
      }
    },
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData
  })
}

export function useLocations(page: number) {
  return useQuery(locationsOptions(page))
}

export function locationOptions(locationId: number) {
  return queryOptions({
    queryKey: ['location', locationId],
    queryFn: async () => {
      const response = await getLocation(locationId)

      if (response.status !== OK_STATUS) {
        throw new Error(response.statusMessage)
      }

      return response.data
    },
    staleTime: STALE_TIME
  })
}

export function useLocation(locationId: number) {
  return useQuery(locationOptions(locationId))
}
