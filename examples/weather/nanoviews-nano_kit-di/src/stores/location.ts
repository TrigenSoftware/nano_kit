import {
  paced,
  debounce,
  onMount,
  mountable,
  computed,
  atIndex,
  inject
} from '@nano_kit/store'
import { localStored } from '@nano_kit/platform-web'
import { queryKey } from '@nano_kit/query'
import type { City } from '../services/types.js'
import * as Cities from '../services/cities.js'
import * as Location from '../services/location.js'
import { QueryClient$ } from './query.js'

const INPUT_DEBOUNCE = 300

export function LocationSearch$() {
  const $searchQuery = mountable(localStored('locationSearch', ''))
  const $searchInputValue = paced($searchQuery, debounce(INPUT_DEBOUNCE))

  onMount($searchQuery, () => {
    if (!$searchQuery()) {
      void Location.fetchCurrentCity().then((city) => {
        if (city && !$searchQuery()) {
          $searchQuery(city.label)
        }
      })
    }
  })

  return {
    $searchQuery,
    $searchInputValue
  }
}

export function CitySuggestions$() {
  const { query } = inject(QueryClient$)
  const { $searchQuery } = inject(LocationSearch$)
  const [$suggestionsData] = query<[query: string], City[]>(queryKey('citySuggestions'), [$searchQuery], async (queryValue) => {
    if (!queryValue.trim()) {
      return []
    }

    return await Cities.fetchCities(queryValue)
  })
  const $suggestions = computed(() => $suggestionsData() || [])
  const $currentLocation = atIndex($suggestions, 0)

  return {
    $suggestions,
    $currentLocation
  }
}
