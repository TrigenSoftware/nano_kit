import type {
  Character,
  Episode,
  Location,
  Info,
  CharacterFilter,
  LocationFilter,
  EpisodeFilter
} from './types'

export * from './types'

const BASE_URL = 'https://rickandmortyapi.com/api'

async function fetchApi<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    signal
  })

  if (!response.ok) {
    throw new Error(response.statusText || String(response.status))
  }

  return await response.json() as T
}

export function idsFromUrls(urls: string[]) {
  return urls.map((url) => {
    const parts = url.split('/')

    return Number(parts[parts.length - 1])
  }).filter(Number.isInteger)
}

export async function getCharacters(
  filters?: CharacterFilter,
  signal?: AbortSignal
): Promise<Info<Character[]>> {
  const params = new URLSearchParams()

  if (filters?.page) {
    params.append('page', filters.page.toString())
  }

  if (filters?.name) {
    params.append('name', filters.name)
  }

  if (filters?.status) {
    params.append('status', filters.status)
  }

  if (filters?.species) {
    params.append('species', filters.species)
  }

  if (filters?.type) {
    params.append('type', filters.type)
  }

  if (filters?.gender) {
    params.append('gender', filters.gender)
  }

  const queryString = params.toString()
  const url = `${BASE_URL}/character${queryString ? `?${queryString}` : ''}`

  return await fetchApi<Info<Character[]>>(url, signal)
}

export async function getCharacter<T extends number | number[]>(
  id: T,
  signal?: AbortSignal
): Promise<T extends number ? Character : Character[]> {
  const ids = Array.isArray(id) ? id.join(',') : id
  const url = `${BASE_URL}/character/${ids}`

  return await fetchApi(url, signal)
}

export async function getLocations(
  filters?: LocationFilter,
  signal?: AbortSignal
): Promise<Info<Location[]>> {
  const params = new URLSearchParams()

  if (filters?.page) {
    params.append('page', filters.page.toString())
  }

  if (filters?.name) {
    params.append('name', filters.name)
  }

  if (filters?.type) {
    params.append('type', filters.type)
  }

  if (filters?.dimension) {
    params.append('dimension', filters.dimension)
  }

  const queryString = params.toString()
  const url = `${BASE_URL}/location${queryString ? `?${queryString}` : ''}`

  return await fetchApi<Info<Location[]>>(url, signal)
}

export async function getLocation<T extends number | number[]>(
  id: T,
  signal?: AbortSignal
): Promise<T extends number ? Location : Location[]> {
  const ids = Array.isArray(id) ? id.join(',') : id
  const url = `${BASE_URL}/location/${ids}`

  return await fetchApi(url, signal)
}

export async function getEpisodes(
  filters?: EpisodeFilter,
  signal?: AbortSignal
): Promise<Info<Episode[]>> {
  const params = new URLSearchParams()

  if (filters?.page) {
    params.append('page', filters.page.toString())
  }

  if (filters?.name) {
    params.append('name', filters.name)
  }

  if (filters?.episode) {
    params.append('episode', filters.episode)
  }

  const queryString = params.toString()
  const url = `${BASE_URL}/episode${queryString ? `?${queryString}` : ''}`

  return await fetchApi<Info<Episode[]>>(url, signal)
}

export async function getEpisode<T extends number | number[]>(
  id: T,
  signal?: AbortSignal
): Promise<T extends number ? Episode : Episode[]> {
  const ids = Array.isArray(id) ? id.join(',') : id
  const url = `${BASE_URL}/episode/${ids}`

  return await fetchApi(url, signal)
}
