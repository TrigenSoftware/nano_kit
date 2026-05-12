/* eslint-disable @typescript-eslint/naming-convention */
export interface CharacterLocation {
  name: string
  url: string
}

export interface ResourceBase {
  id: number
  name: string
  url: string
  created: string
}

export interface CharacterFilter {
  page?: number
}

export interface LocationFilter {
  page?: number
}

export interface EpisodeFilter {
  page?: number
}

export interface Character extends ResourceBase {
  status: 'Dead' | 'Alive' | 'unknown'
  species: string
  type: string
  gender: 'Female' | 'Male' | 'Genderless' | 'unknown'
  origin: CharacterLocation
  location: CharacterLocation
  image: string
  episode: string[]
}

export interface Location extends ResourceBase {
  type: string
  dimension: string
  residents: string[]
}

export interface Episode extends ResourceBase {
  air_date: string
  episode: string
  characters: string[]
}

export interface ApiResponse<T> {
  status: number
  statusMessage: string
  data: T
}

export interface Info<T> {
  info?: {
    count: number
    pages: number
    next: string | null
    prev: string | null
  }
  results?: T
}
