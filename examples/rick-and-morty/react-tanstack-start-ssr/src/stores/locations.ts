import {
  keepPreviousData,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import {
  type Location,
  getLocation,
  getLocations
} from '#src/services/api'
import { STALE_TIME } from '#src/common/constants'

export interface Page<T> {
  items: T[]
  totalPages: number
}

export function locationsOptions(page: number) {
  return queryOptions({
    queryKey: ['locations', page],
    queryFn: async ({ signal }): Promise<Page<Location>> => {
      const data = await getLocations({
        page
      }, signal)

      return {
        items: data.results ?? [],
        totalPages: data.info?.pages ?? 0
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
    queryFn: ({ signal }) => getLocation(locationId, signal),
    staleTime: STALE_TIME
  })
}

export function useLocation(locationId: number) {
  return useQuery(locationOptions(locationId))
}
