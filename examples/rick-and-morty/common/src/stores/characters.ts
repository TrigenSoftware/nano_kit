import { queryKey } from '@nano_kit/query'
import {
  type Character,
  getEpisodeCharacters,
  getCharacter,
  getCharacters,
  getLocationResidents
} from '../services/api'
import { OK_STATUS } from '../common/constants'
import {
  type Page,
  query
} from './query'
import {
  $characterId,
  $charactersPage,
  $episodeId,
  $locationId
} from './router'

export const [
  $characters,
  $charactersError,
  $charactersLoading
] = query<[page: number], Page<Character>>(
  queryKey('characters'),
  [$charactersPage],
  async (page) => {
    if (page === 0) {
      return {
        items: [],
        totalPages: 0
      }
    }

    const response = await getCharacters({
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
  $character,
  $characterError,
  $characterLoading
] = query<[id: number | null], Character | null>(
  queryKey('character'),
  [$characterId],
  async (id) => {
    if (id === null) {
      return null
    }

    const response = await getCharacter(id)

    if (response.status === OK_STATUS && response.data) {
      return response.data
    }

    throw new Error(response.statusMessage)
  }
)

export const [
  $residents,
  $residentsError,
  $residentsLoading
] = query<[locationId: number | null, episodeId: number | null], Character[]>(
  queryKey('residents'),
  [
    $locationId,
    $episodeId
  ],
  async (locationId, episodeId) => {
    if (!locationId && !episodeId) {
      return []
    }

    const response = locationId
      ? await getLocationResidents(locationId)
      : await getEpisodeCharacters(episodeId as number)

    if (response.status === OK_STATUS) {
      return response.data
    }

    throw new Error(response.statusMessage)
  }
)
