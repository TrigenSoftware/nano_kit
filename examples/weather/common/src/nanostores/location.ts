import {
  atom,
  computed,
  onMount
} from 'nanostores'
import { persistentAtom } from '@nanostores/persistent'
import type { City } from '../services/types.js'
import * as Cities from '../services/cities.js'
import * as Location from '../services/location.js'
import { createFetcherStore } from './query.js'

function debounce<T extends unknown[]>(fn: (...args: [...T]) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>

  return (...args: T) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

const INPUT_DEBOUNCE = 300

export const $locationSearch = persistentAtom<string>('locationSearch', '')

onMount($locationSearch, () => {
  if (!$locationSearch.get()) {
    fetchCurrentCity()
  }
})

export const $locationSearchDebounced = atom('')

onMount($locationSearchDebounced, () => $locationSearch.subscribe(debounce((value) => {
  $locationSearchDebounced.set(value)
}, INPUT_DEBOUNCE)))

export const $citySuggestionsStore = createFetcherStore<City[]>(
  ['citySuggestions/', $locationSearchDebounced],
  {
    async fetcher() {
      const query = $locationSearchDebounced.get()

      if (!query.trim()) {
        return []
      }

      return await Cities.fetchCities(query)
    }
  }
)

export const $citySuggestions = computed($citySuggestionsStore, store => store.data ?? [])

export const $currentLocation = computed($citySuggestions, citySuggestions => citySuggestions[0])

export const $currentLocationKey = computed($currentLocation, city => (city ? `${city.lat},${city.lon}` : null))

async function fetchCurrentCity() {
  const city = await Location.fetchCurrentCity()

  if (!$locationSearch.get() && city) {
    $locationSearch.set(city.label)
  }
}
