import {
  computed,
  inject
} from '@nano_kit/store'
import { queryKey } from '@nano_kit/query'
import {
  type Character,
  getCharacter,
  getCharacters
} from '#src/services/api'
import { OK_STATUS } from '#src/common/constants'
import {
  type Page,
  Client$
} from './query'
import { Params$ } from './router'
import { Location$ } from './locations'
import { Episode$ } from './episodes'

export function Characters$() {
  const { query } = inject(Client$)
  const { $charactersPage } = inject(Params$)
  const [
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
  const { $location } = inject(Location$)
  const { $episode } = inject(Episode$)
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
  const [
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

  return {
    $residents,
    $residentsError,
    $residentsLoading
  }
}
