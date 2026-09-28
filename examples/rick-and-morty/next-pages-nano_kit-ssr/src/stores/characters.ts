import { inject } from '@nano_kit/store'
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
  Client$
} from './query'
import { Params$ } from './router'

const CharactersKey = queryKey<[page: number], Page<Character>>('characters')
const CharacterKey = queryKey<[id: number | null], Character | null>('character')
const ResidentsKey = queryKey<[locationId: number | null, episodeId: number | null], Character[]>('residents')

export function Characters$() {
  const { query } = inject(Client$)
  const { $charactersPage } = inject(Params$)
  const [
    $characters,
    $charactersError,
    $charactersLoading
  ] = query(
    CharactersKey,
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

  return {
    $characters,
    $charactersError,
    $charactersLoading
  }
}

export function Character$() {
  const { query } = inject(Client$)
  const { $characterId } = inject(Params$)
  const [
    $character,
    $characterError,
    $characterLoading
  ] = query(
    CharacterKey,
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

  return {
    $character,
    $characterError,
    $characterLoading
  }
}

export function Residents$() {
  const { query } = inject(Client$)
  const {
    $locationId,
    $episodeId
  } = inject(Params$)
  const [
    $residents,
    $residentsError,
    $residentsLoading
  ] = query(
    ResidentsKey,
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

  return {
    $residents,
    $residentsError,
    $residentsLoading
  }
}
