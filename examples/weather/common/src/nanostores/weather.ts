import { computed } from 'nanostores'
import type { Weather } from '../services/types.js'
import * as WeatherService from '../services/weather.js'
import { $currentLocation, $currentLocationKey } from './location.js'
import { createFetcherStore } from './query.js'

export const $currentWeatherStore = createFetcherStore<Weather | null>(
  ['currentWeather/', $currentLocationKey],
  {
    async fetcher() {
      const city = $currentLocation.get()

      if (!city) {
        return null
      }

      return await WeatherService.fetchWeather(city)
    }
  }
)

export const $currentWeather = computed($currentWeatherStore, store => store.data ?? null)

export const $weatherForecastStore = createFetcherStore<Weather[]>(
  ['weatherForecast/', $currentLocationKey],
  {
    async fetcher() {
      const city = $currentLocation.get()

      if (!city) {
        return []
      }

      return await WeatherService.fetchWeatherForecast(city)
    }
  }
)

export const $weatherForecast = computed($weatherForecastStore, store => store.data ?? [])
