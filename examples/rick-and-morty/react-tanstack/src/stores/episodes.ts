import {
  keepPreviousData,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import {
  type Episode,
  getCharacterEpisodes,
  getEpisode,
  getEpisodes
} from '../services/api'
import {
  OK_STATUS,
  STALE_TIME
} from '../common/constants'

export interface Page<T> {
  items: T[]
  totalPages: number
}

export function episodesOptions(page: number) {
  return queryOptions({
    queryKey: ['episodes', page],
    queryFn: async (): Promise<Page<Episode>> => {
      const response = await getEpisodes({
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

export function useEpisodes(page: number) {
  return useQuery(episodesOptions(page))
}

export function episodeOptions(episodeId: number) {
  return queryOptions({
    queryKey: ['episode', episodeId],
    queryFn: async () => {
      const response = await getEpisode(episodeId)

      if (response.status !== OK_STATUS) {
        throw new Error(response.statusMessage)
      }

      return response.data
    },
    staleTime: STALE_TIME
  })
}

export function useEpisode(episodeId: number) {
  return useQuery(episodeOptions(episodeId))
}

export function characterEpisodesOptions(characterId: number) {
  return queryOptions({
    queryKey: ['characterEpisodes', characterId],
    queryFn: async () => {
      const response = await getCharacterEpisodes(characterId)

      if (response.status !== OK_STATUS) {
        throw new Error(response.statusMessage)
      }

      return response.data
    },
    staleTime: STALE_TIME
  })
}

export function useCharacterEpisodes(characterId: number) {
  return useQuery(characterEpisodesOptions(characterId))
}
