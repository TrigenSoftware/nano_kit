import {
  keepPreviousData,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import {
  type Character,
  getEpisodeCharacters,
  getCharacter,
  getCharacters,
  getLocationResidents
} from '../services/api'
import {
  OK_STATUS,
  STALE_TIME
} from '../common/constants'

export interface Page<T> {
  items: T[]
  totalPages: number
}

export function charactersOptions(page: number) {
  return queryOptions({
    queryKey: ['characters', page],
    queryFn: async (): Promise<Page<Character>> => {
      const response = await getCharacters({
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

export function useCharacters(page: number) {
  return useQuery(charactersOptions(page))
}

export function characterOptions(characterId: number) {
  return queryOptions({
    queryKey: ['character', characterId],
    queryFn: async () => {
      const response = await getCharacter(characterId)

      if (response.status !== OK_STATUS) {
        throw new Error(response.statusMessage)
      }

      return response.data
    },
    staleTime: STALE_TIME
  })
}

export function useCharacter(characterId: number) {
  return useQuery(characterOptions(characterId))
}

export function locationResidentsOptions(locationId: number) {
  return queryOptions({
    queryKey: ['locationResidents', locationId],
    queryFn: async () => {
      const response = await getLocationResidents(locationId)

      if (response.status !== OK_STATUS) {
        throw new Error(response.statusMessage)
      }

      return response.data
    },
    staleTime: STALE_TIME
  })
}

export function useLocationResidents(locationId: number) {
  return useQuery(locationResidentsOptions(locationId))
}

export function episodeCharactersOptions(episodeId: number) {
  return queryOptions({
    queryKey: ['episodeCharacters', episodeId],
    queryFn: async () => {
      const response = await getEpisodeCharacters(episodeId)

      if (response.status !== OK_STATUS) {
        throw new Error(response.statusMessage)
      }

      return response.data
    },
    staleTime: STALE_TIME
  })
}

export function useEpisodeCharacters(episodeId: number) {
  return useQuery(episodeCharactersOptions(episodeId))
}
