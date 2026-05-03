import { useStore } from '@nanostores/solid'
import {
  $locationSearch,
  $citySuggestions
} from '../stores/location.js'
import { Autocomplete } from './Autocomplete.jsx'

export function CityInput() {
  const locationSearch = useStore($locationSearch)
  const citySuggestions = useStore($citySuggestions)

  return (
    <Autocomplete
      id='city'
      label='Search for a city'
      name='city'
      value={locationSearch()}
      suggestions={citySuggestions()}
      onChange={value => $locationSearch.set(value)}
    />
  )
}
