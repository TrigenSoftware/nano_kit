import { computed } from '@nano_kit/store'
import { queryKey } from '@nano_kit/query'
import {
  type Episode,
  getEpisode,
  getEpisodes
} from '#src/services/api'
import { OK_STATUS } from '#src/common/constants'
import {
  type Page,
  query
} from './query'
import {
  $characterId,
  $episodeId,
  $episodesPage
} from './router'
import { $character } from './characters'

export const [
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

export const [
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

export const [
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
