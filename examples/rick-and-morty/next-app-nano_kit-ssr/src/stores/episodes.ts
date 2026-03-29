import {
  inject,
  computed
} from '@nano_kit/store'
import { queryKey } from '@nano_kit/query'
import {
  type Episode,
  getEpisode,
  getEpisodes
} from '@/services/api'
import { OK_STATUS } from '@/common/constants'
import {
  type Page,
  Client$
} from './query'
import { Params$ } from './router'
import { Character$ } from './characters'

export function Episodes$() {
  const { query } = inject(Client$)
  const { $episodesPage } = inject(Params$)
  const [
    $episodes,
    $episodesError,
    $episodesLoading
  ] = query<[page: number], Page<Episode>>(
    queryKey('episodes'),
    [$episodesPage],
    async (page) => {
      if (page === 0) {
        return {
          items: [],
          totalPages: 0
        }
      }

      const response = await getEpisodes({
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
    $episodes,
    $episodesError,
    $episodesLoading
  }
}

export function Episode$() {
  const { query } = inject(Client$)
  const { $episodeId } = inject(Params$)
  const [
    $episode,
    $episodeError,
    $episodeLoading
  ] = query<[id: number | null], Episode | null>(
    queryKey('episode'),
    [$episodeId],
    async (id) => {
      if (id === null) {
        return null
      }

      const response = await getEpisode(id)

      if (response.status === OK_STATUS && response.data) {
        return response.data
      }

      throw new Error(response.statusMessage)
    }
  )

  return {
    $episode,
    $episodeError,
    $episodeLoading
  }
}

export function CharacterEpisodes$() {
  const { query } = inject(Client$)
  const { $characterId } = inject(Params$)
  const { $character } = inject(Character$)
  const $episodesIds = computed(() => {
    const characterId = $characterId()
    let episodes

    if (characterId) {
      episodes = $character()?.episode
    }

    return episodes?.map((ep) => {
      const parts = ep.split('/')

      return Number(parts[parts.length - 1])
    }).sort() || []
  })
  const [
    $characterEpisodes,
    $characterEpisodesError,
    $characterEpisodesLoading
  ] = query<[ids: number[]], Episode[]>(
    queryKey('characterEpisodes'),
    [$episodesIds],
    async (ids) => {
      if (ids.length === 0) {
        return []
      }

      const response = await getEpisode(ids)

      if (response.status === OK_STATUS) {
        return Array.isArray(response.data)
          ? response.data
          : [response.data]
      }

      throw new Error(response.statusMessage)
    }
  )

  return {
    $characterEpisodes,
    $characterEpisodesError,
    $characterEpisodesLoading
  }
}
