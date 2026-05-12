import { inject } from '@nano_kit/store'
import {
  forRoute,
  Location$,
  param,
  searchParam,
  searchParams
} from '@nano_kit/router'

export const routes = {
  home: '/',
  characters: '/characters',
  character: '/character/:id',
  locations: '/locations',
  location: '/location/:id',
  episodes: '/episodes',
  episode: '/episode/:id'
} as const

export function Params$() {
  const $location = inject(Location$)
  const $searchParams = searchParams($location)
  const $id = param($location, 'id', v => (v ? Number(v) : null))
  const $page = searchParam($searchParams, 'page', v => (v ? Number(v) : 1))
  const $characterId = forRoute($location, 'character', $id, null)
  const $locationId = forRoute($location, 'location', $id, null)
  const $episodeId = forRoute($location, 'episode', $id, null)
  const $charactersPage = forRoute($location, 'characters', $page, 1)
  const $locationsPage = forRoute($location, 'locations', $page, 1)
  const $episodesPage = forRoute($location, 'episodes', $page, 1)

  return {
    $charactersPage,
    $locationsPage,
    $episodesPage,
    $characterId,
    $locationId,
    $episodeId
  }
}
