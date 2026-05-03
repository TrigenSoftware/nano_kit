import {
  browserNavigation,
  buildPaths,
  forRoute,
  param,
  searchParam,
  searchParams
} from '@nano_kit/router'

const routes = {
  home: '/',
  characters: '/characters',
  character: '/character/:id',
  locations: '/locations',
  location: '/location/:id',
  episodes: '/episodes',
  episode: '/episode/:id'
} as const

export const [$location, navigation] = browserNavigation(routes)

const $searchParams = searchParams($location)
const $id = param($location, 'id', v => (v ? Number(v) : null))
const $page = searchParam($searchParams, 'page', v => (v ? Number(v) : 1))

export const $characterId = forRoute($location, 'character', $id, null)
export const $locationId = forRoute($location, 'location', $id, null)
export const $episodeId = forRoute($location, 'episode', $id, null)

export const $charactersPage = forRoute($location, 'characters', $page, 1)
export const $locationsPage = forRoute($location, 'locations', $page, 1)
export const $episodesPage = forRoute($location, 'episodes', $page, 1)

export const paths = buildPaths(routes)
