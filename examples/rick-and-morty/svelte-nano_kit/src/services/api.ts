import type {
  Character,
  Episode,
  Location,
  ApiResponse,
  Info,
  CharacterFilter,
  LocationFilter,
  EpisodeFilter
} from './types'

export * from './types'

const BASE_URL = 'https://rickandmortyapi.com/api'

async function fetchApi<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      return {
        status: response.status,
        statusMessage: response.statusText || String(response.status),
        data: {} as T
      }
    }

    const data = await response.json()

    return {
      status: response.status,
      statusMessage: response.statusText || String(response.status),
      data
    }
  } catch (error) {
    return {
      status: 500,
      statusMessage: error instanceof Error ? error.message : 'Unknown error',
      data: {} as T
    }
  }
}

export async function getCharacters(filters?: CharacterFilter): Promise<ApiResponse<Info<Character[]>>> {
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

  return await fetchApi<Info<Character[]>>(url)
}

export async function getCharacter<T extends number | number[]>(
  id: T
): Promise<ApiResponse<T extends number ? Character : Character[]>> {
  const ids = Array.isArray(id) ? id.join(',') : id
  const url = `${BASE_URL}/character/${ids}`

  return await fetchApi(url)
}

export async function getLocations(filters?: LocationFilter): Promise<ApiResponse<Info<Location[]>>> {
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

  return await fetchApi<Info<Location[]>>(url)
}

export async function getLocation<T extends number | number[]>(
  id: T
): Promise<ApiResponse<T extends number ? Location : Location[]>> {
  const ids = Array.isArray(id) ? id.join(',') : id
  const url = `${BASE_URL}/location/${ids}`

  return await fetchApi(url)
}

export async function getEpisodes(filters?: EpisodeFilter): Promise<ApiResponse<Info<Episode[]>>> {
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

  return await fetchApi<Info<Episode[]>>(url)
}

export async function getEpisode<T extends number | number[]>(
  id: T
): Promise<ApiResponse<T extends number ? Episode : Episode[]>> {
  const ids = Array.isArray(id) ? id.join(',') : id
  const url = `${BASE_URL}/episode/${ids}`

  return await fetchApi(url)
}
