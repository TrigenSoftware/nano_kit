import { useSignal } from '@nano_kit/react'
import {
  $locationSearchInputValue,
  $citySuggestions
} from '../stores/location.js'
import { Autocomplete } from './Autocomplete.jsx'

export function CityInput() {
  const locationSearchQuery = useSignal($locationSearchInputValue)
  const citySuggestions = useSignal($citySuggestions)

  return (
    <Autocomplete
      id='city'
      label='Search for a city'
      name='city'
      value={locationSearchQuery}
      suggestions={citySuggestions}
      onChange={$locationSearchInputValue}
    />
  )
}
