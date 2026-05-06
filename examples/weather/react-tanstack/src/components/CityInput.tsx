import { useWeather } from '../stores/context.jsx'
import { useCitySuggestions } from '../stores/cities.js'
import { Autocomplete } from './Autocomplete.jsx'

export function CityInput() {
  const { locationSearch, setLocationSearch } = useWeather()
  const { data: citySuggestions = [] } = useCitySuggestions(locationSearch)

  return (
    <Autocomplete
      id='city'
      label='Search for a city'
      name='city'
      value={locationSearch}
      suggestions={citySuggestions}
      onChange={setLocationSearch}
    />
  )
}
