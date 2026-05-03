export interface Coords {
  latitude: number
  longitude: number
}

export interface City {
  name: string
  country: string
  lat: number
  lon: number
  label: string
}

export interface Weather {
  date: Date
  dateText: string
  temp: number
  tempText: string
  feelsLike: number
  feelsLikeText: string
  humidity: number
  description: string
  icon: string
}
