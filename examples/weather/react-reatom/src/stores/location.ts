import {
  atom,
  computed,
  withAsyncData,
  wrap,
  abortVar,
  withLocalStorage,
  withConnectHook
} from '@reatom/core'
import type { City } from '../services/types.js'
import * as Cities from '../services/cities.js'
import * as Location from '../services/location.js'

const INPUT_DEBOUNCE = 300

export const $locationSearchQuery = atom('').extend(withLocalStorage({
  key: 'weather.location-search',
  version: 1
}))
export const $locationSearchQueryPaced = atom($locationSearchQuery()).extend(
  withConnectHook(() => {
    let pacedTimer: ReturnType<typeof setTimeout> | undefined
    const unsubscribe = $locationSearchQuery.subscribe((value) => {
      clearTimeout(pacedTimer)
      pacedTimer = setTimeout(() => {
        $locationSearchQueryPaced.set(value)
      }, INPUT_DEBOUNCE)
    })

    return () => {
      clearTimeout(pacedTimer)
      unsubscribe()
    }
  })
)

const citySuggestionsResource = computed(async () => {
  const query = $locationSearchQueryPaced()

  if (!query.trim()) {
    return []
  }

  const { controller, unsubscribe } = abortVar.subscribe()

  try {
    return await wrap(Cities.fetchCities(query, controller.signal))
  } finally {
    unsubscribe()
  }
}).extend(withAsyncData({
  initState: [] as City[]
}))
const geolocationResource = computed(async () => {
  const { controller, unsubscribe } = abortVar.subscribe()

  try {
    return await wrap(Location.fetchCurrentCity(controller.signal))
  } finally {
    unsubscribe()
  }
}).extend(withAsyncData({
  initState: null as City | null
}))

export const $citySuggestions = citySuggestionsResource.data
export const $citySuggestionsError = citySuggestionsResource.error
export const $citySuggestionsLoading = computed(() => !citySuggestionsResource.ready())
export const $currentLocation = computed(() => $citySuggestions()[0])
export const $initialLocationSearchQuery = atom(null).extend(withConnectHook(() => {
  if ($locationSearchQuery()) {
    return undefined
  }

  const unsubscribe = geolocationResource.data.subscribe((city) => {
    if (!$locationSearchQuery() && city) {
      $locationSearchQuery.set(city.label)
      unsubscribe()
    }
  })

  return unsubscribe
}))
