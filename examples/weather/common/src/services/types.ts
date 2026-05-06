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

export type WeatherPeriod = 'current' | 'hourly' | 'daily'

export interface Weather {
  date: Date
  dateText: string
  period: WeatherPeriod
  temp: number
  tempText: string
  feelsLike: number
  feelsLikeText: string
  humidity: number
  description: string
  icon: string
}
