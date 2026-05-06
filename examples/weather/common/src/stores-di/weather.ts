import {
  computed,
  record,
  inject
} from '@nano_kit/store'
import { queryKey } from '@nano_kit/query'
import type {
  City,
  Weather
} from '../services/types.js'
import * as WeatherService from '../services/weather.js'
import { QueryClient$ } from './query.js'
import { CitySuggestions$ } from './location.js'

export function CurrentWeather$() {
  const { query } = inject(QueryClient$)
  const { $currentLocation } = inject(CitySuggestions$)
  const [$weatherData] = query<[city: City | undefined], Weather | null>(
    queryKey('currentWeather'),
    [$currentLocation],
    async (city) => {
      if (!city) {
        return null
      }

      return await WeatherService.fetchWeather(city)
    }
  )
  const $weather = record($weatherData)

  return {
    $weather
  }
}

export function WeatherForecast$() {
  const { query } = inject(QueryClient$)
  const { $currentLocation } = inject(CitySuggestions$)
  const [$forecastData] = query<[city: City | undefined], Weather[]>(
    queryKey('weatherForecast'),
    [$currentLocation],
    async (city) => {
      if (!city) {
        return []
      }

      return await WeatherService.fetchWeatherForecast(city)
    }
  )
  const $forecast = computed(() => $forecastData() || [])

  return {
    $forecast
  }
}

