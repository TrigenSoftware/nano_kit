import { computed } from '@nano_kit/store'
import { queryKey } from '@nano_kit/query'
import {
  type Character,
  getCharacter,
  getCharacters
} from '#src/services/api'
import { OK_STATUS } from '#src/common/constants'
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
import { $location } from './locations'
import { $episode } from './episodes'

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

const $residentsIds = computed(() => {
  const locationId = $locationId()
  const episodeId = $episodeId()
  let refs

  if (locationId) {
    refs = $location()?.residents
  } else if (episodeId) {
    refs = $episode()?.characters
  }

  return refs?.map((ref) => {
    const parts = ref.split('/')

    return Number(parts[parts.length - 1])
  }).sort() || []
})

export const [
  $residents,
  $residentsError,
  $residentsLoading
] = query<[ids: number[]], Character[]>(
  queryKey('residents'),
  [$residentsIds],
  async (ids) => {
    if (ids.length === 0) {
      return []
    }

    const response = await getCharacter(ids)

    if (response.status === OK_STATUS) {
      return Array.isArray(response.data)
        ? response.data
        : [response.data]
    }

    throw new Error(response.statusMessage)
  }
)
