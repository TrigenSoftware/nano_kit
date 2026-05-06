import { queryKey } from '@nano_kit/query'
import {
  type Episode,
  getCharacterEpisodes,
  getEpisode,
  getEpisodes
} from '../services/api'
import { OK_STATUS } from '../common/constants'
import {
  type Page,
  query
} from './query'
import {
  $characterId,
  $episodeId,
  $episodesPage
} from './router'

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

export const [
  $characterEpisodes,
  $characterEpisodesError,
  $characterEpisodesLoading
] = query<[characterId: number | null], Episode[]>(
  queryKey('characterEpisodes'),
  [$characterId],
  async (characterId) => {
    if (!characterId) {
      return []
    }

    const response = await getCharacterEpisodes(characterId)

    if (response.status === OK_STATUS) {
      return response.data
    }

    throw new Error(response.statusMessage)
  }
)
