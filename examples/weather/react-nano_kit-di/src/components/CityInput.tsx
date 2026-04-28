import { useCallback } from 'react'
import {
  useInject,
  useSignal
} from '@nano_kit/react'
import {
  LocationSearch$,
  CitySuggestions$
} from '../stores/location.js'
import styles from './CityInput.module.css'

export function CityInput() {
  const { $searchInputValue } = useInject(LocationSearch$)
  const { $suggestions } = useInject(CitySuggestions$)
  const searchQuery = useSignal($searchInputValue)
  const suggestions = useSignal($suggestions)
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => $searchInputValue(e.target.value),
    [$searchInputValue]
  )

  return (
    <div className={styles.root}>
      <label
        htmlFor='city'
        className={styles.label}
      >
        Search for a city:
      </label>
      <input
        className={styles.input}
        id='city'
        type='text'
        list='cities'
        name='city'
        value={searchQuery}
        onChange={handleChange}
      />
      <datalist id='cities'>
        {suggestions.map(city => (
          <option
            key={city.label}
            value={city.label}
          />
        ))}
      </datalist>
    </div>
  )
}
