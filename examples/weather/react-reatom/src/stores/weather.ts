import {
  computed,
  withAsyncData,
  wrap,
  abortVar
} from '@reatom/core'
import type { Weather } from '../services/types.js'
import * as WeatherService from '../services/weather.js'
import { $currentLocation } from './location.js'

const currentWeatherResource = computed(async () => {
  const city = $currentLocation()

  if (!city) {
    return null
  }

  const { controller, unsubscribe } = abortVar.subscribe()

  try {
    return await wrap(WeatherService.fetchWeather(city, controller.signal))
  } finally {
    unsubscribe()
  }
}).extend(withAsyncData({
  initState: null as Weather | null
}))
const weatherForecastResource = computed(async () => {
  const city = $currentLocation()

  if (!city) {
    return []
  }

  const { controller, unsubscribe } = abortVar.subscribe()

  try {
    return await wrap(WeatherService.fetchWeatherForecast(city, controller.signal))
  } finally {
    unsubscribe()
  }
}).extend(withAsyncData({
  initState: [] as Weather[]
}))

export const $currentWeather = currentWeatherResource.data
export const $currentWeatherError = currentWeatherResource.error
export const $currentWeatherLoading = computed(() => !currentWeatherResource.ready())

export const $weatherForecast = weatherForecastResource.data
export const $weatherForecastError = weatherForecastResource.error
export const $weatherForecastLoading = computed(() => !weatherForecastResource.ready())
