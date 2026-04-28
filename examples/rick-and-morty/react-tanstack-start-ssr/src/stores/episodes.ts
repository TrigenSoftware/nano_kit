import {
  keepPreviousData,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import {
  type Episode,
  getEpisode,
  getEpisodes
} from '#src/services/api'
import { STALE_TIME } from '#src/common/constants'

export interface Page<T> {
  items: T[]
  totalPages: number
}

export function episodesOptions(page: number) {
  return queryOptions({
    queryKey: ['episodes', page],
    queryFn: async ({ signal }): Promise<Page<Episode>> => {
      const data = await getEpisodes({
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

export function useEpisodes(page: number) {
  return useQuery(episodesOptions(page))
}

export function episodeOptions(episodeId: number) {
  return queryOptions({
    queryKey: ['episode', episodeId],
    queryFn: ({ signal }) => getEpisode(episodeId, signal),
    staleTime: STALE_TIME
  })
}

export function useEpisode(episodeId: number) {
  return useQuery(episodeOptions(episodeId))
}

export function episodesByIdsOptions(ids: number[]) {
  return queryOptions({
    queryKey: ['episodesByIds', ids],
    queryFn: async ({ signal }): Promise<Episode[]> => {
      if (ids.length === 0) {
        return []
      }

      const data = await getEpisode(ids, signal)

      return Array.isArray(data) ? data : [data]
    },
    staleTime: STALE_TIME
  })
}

export function useEpisodesByIds(ids: number[]) {
  return useQuery(episodesByIdsOptions(ids))
}
