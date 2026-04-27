import {
  keepPreviousData,
  queryOptions,
  useQuery
} from '@tanstack/react-query'
import {
  type Character,
  getCharacter,
  getCharacters
} from '#src/services/api'
import { STALE_TIME } from '#src/common/constants'

export interface Page<T> {
  items: T[]
  totalPages: number
}

export function charactersOptions(page: number) {
  return queryOptions({
    queryKey: ['characters', page],
    queryFn: async ({ signal }): Promise<Page<Character>> => {
      const data = await getCharacters({
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

export function useCharacters(page: number) {
  return useQuery(charactersOptions(page))
}

export function characterOptions(characterId: number) {
  return queryOptions({
    queryKey: ['character', characterId],
    queryFn: ({ signal }) => getCharacter(characterId, signal),
    staleTime: STALE_TIME
  })
}

export function useCharacter(characterId: number) {
  return useQuery(characterOptions(characterId))
}

export function charactersByIdsOptions(ids: number[]) {
  return queryOptions({
    queryKey: ['charactersByIds', ids],
    queryFn: async ({ signal }): Promise<Character[]> => {
      if (ids.length === 0) {
        return []
      }

      const data = await getCharacter(ids, signal)

      return Array.isArray(data) ? data : [data]
    },
    staleTime: STALE_TIME
  })
}

export function useResidents(ids: number[]) {
  return useQuery(charactersByIdsOptions(ids))
}
