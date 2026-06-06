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

export type * from './types'

const BASE_URL = 'https://trigensoftware.github.io/rick-and-morty-api/api'

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
  return await fetchApi(`${BASE_URL}/character/page/${filters?.page || 1}.json`)
}

export async function getCharacter(id: number): Promise<ApiResponse<Character>> {
  return await fetchApi(`${BASE_URL}/character/${id}.json`)
}

export async function getLocationResidents(id: number): Promise<ApiResponse<Character[]>> {
  return await fetchApi(`${BASE_URL}/location/residents/${id}.json`)
}

export async function getEpisodeCharacters(id: number): Promise<ApiResponse<Character[]>> {
  return await fetchApi(`${BASE_URL}/episode/characters/${id}.json`)
}

export async function getLocations(filters?: LocationFilter): Promise<ApiResponse<Info<Location[]>>> {
  return await fetchApi(`${BASE_URL}/location/page/${filters?.page || 1}.json`)
}

export async function getLocation(id: number): Promise<ApiResponse<Location>> {
  return await fetchApi(`${BASE_URL}/location/${id}.json`)
}

export async function getEpisodes(filters?: EpisodeFilter): Promise<ApiResponse<Info<Episode[]>>> {
  return await fetchApi(`${BASE_URL}/episode/page/${filters?.page || 1}.json`)
}

export async function getEpisode(id: number): Promise<ApiResponse<Episode>> {
  return await fetchApi(`${BASE_URL}/episode/${id}.json`)
}

export async function getCharacterEpisodes(id: number): Promise<ApiResponse<Episode[]>> {
  return await fetchApi(`${BASE_URL}/character/episodes/${id}.json`)
}
