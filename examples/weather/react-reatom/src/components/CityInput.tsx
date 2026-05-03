import { useAtom } from '@reatom/react'
import {
  $locationSearchQuery,
  $citySuggestions
} from '../stores/location.js'
import { Autocomplete } from './Autocomplete.jsx'

export function CityInput() {
  const [locationSearchQuery, setLocationSearchQuery] = useAtom($locationSearchQuery)
  const [citySuggestions] = useAtom($citySuggestions)

  return (
    <Autocomplete
      id='city'
      label='Search for a city'
      name='city'
      value={locationSearchQuery}
      suggestions={citySuggestions}
      onChange={setLocationSearchQuery}
    />
  )
}
