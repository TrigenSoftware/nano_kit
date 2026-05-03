import {
  paced,
  debounce,
  onMount,
  mountable,
  computed,
  atIndex
} from '@nano_kit/store'
import { localStored } from '@nano_kit/platform-web'
import { queryKey } from '@nano_kit/query'
import type { City } from '../services/types.js'
import * as Cities from '../services/cities.js'
import * as Location from '../services/location.js'
import { query } from './query.js'

const INPUT_DEBOUNCE = 300

export const $locationSearchQuery = mountable(localStored('locationSearch', ''))

export const $locationSearchInputValue = paced($locationSearchQuery, debounce(INPUT_DEBOUNCE))

export const [$geolocation] = query<[], City | null>(queryKey('geolocation'), [], () => Location.fetchCurrentCity())

onMount($locationSearchQuery, () => {
  if (!$locationSearchQuery()) {
    Location.fetchCurrentCity().then((city) => {
      if (city && !$locationSearchQuery()) {
        $locationSearchQuery(city.label)
      }
    })
  }
})

export const [
  $citySuggestionsData,
  $citySuggestionsError,
  $citySuggestionsLoading
] = query<[query: string], City[]>(queryKey('citySuggestions'), [$locationSearchQuery], async (query) => {
  if (!query.trim()) {
    return []
  }

  return await Cities.fetchCities(query)
})

export const $citySuggestions = computed(() => $citySuggestionsData() || [])

export const $currentLocation = atIndex($citySuggestions, 0)
