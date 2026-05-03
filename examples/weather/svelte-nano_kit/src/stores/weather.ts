import { computed, record } from '@nano_kit/store'
import { queryKey } from '@nano_kit/query'
import type {
  City,
  Weather
} from '../services/types.js'
import * as WeatherService from '../services/weather.js'
import { $currentLocation } from './location.js'
import { query } from './query.js'

export const [
  $currentWeatherData,
  $currentWeatherError,
  $currentWeatherLoading
] = query<[city: City | undefined], Weather | null>(queryKey('currentWeather'), [$currentLocation], async (city) => {
  if (!city) {
    return null
  }

  return await WeatherService.fetchWeather(city)
})

export const $currentWeather = record($currentWeatherData)

export const [
  $weatherForecastData,
  $weatherForecastError,
  $weatherForecastLoading
] = query<[city: City | undefined], Weather[]>(queryKey('weatherForecast'), [$currentLocation], async (city) => {
  if (!city) {
    return []
  }

  return await WeatherService.fetchWeatherForecast(city)
})

export const $weatherForecast = computed(() => $weatherForecastData() || [])
