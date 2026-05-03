import {
  useInject,
  useSignal
} from '@nano_kit/react'
import {
  LocationSearch$,
  CitySuggestions$
} from '../stores/location.js'
import { Autocomplete } from './Autocomplete.jsx'

export function CityInput() {
  const { $searchInputValue } = useInject(LocationSearch$)
  const { $suggestions } = useInject(CitySuggestions$)
  const searchQuery = useSignal($searchInputValue)
  const suggestions = useSignal($suggestions)

  return (
    <Autocomplete
      id='city'
      label='Search for a city'
      name='city'
      value={searchQuery}
      suggestions={suggestions}
      onChange={$searchInputValue}
    />
  )
}
