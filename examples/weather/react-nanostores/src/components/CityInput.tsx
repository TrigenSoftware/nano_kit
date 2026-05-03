import { useCallback } from 'react'
import { useStore } from '@nanostores/react'
import {
  $locationSearch,
  $citySuggestions
} from '../stores/location.js'
import { Autocomplete } from './Autocomplete.jsx'

export function CityInput() {
  const locationSearch = useStore($locationSearch)
  const citySuggestions = useStore($citySuggestions)
  const handleChange = useCallback(
    (value: string) => $locationSearch.set(value),
    []
  )

  return (
    <Autocomplete
      id='city'
      label='Search for a city'
      name='city'
      value={locationSearch}
      suggestions={citySuggestions}
      onChange={handleChange}
    />
  )
}
