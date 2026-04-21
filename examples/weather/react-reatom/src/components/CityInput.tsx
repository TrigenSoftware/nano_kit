import { useCallback } from 'react'
import { useAtom } from '@reatom/react'
import {
  $locationSearchQuery,
  $citySuggestions
} from '../stores/location.js'
import styles from './CityInput.module.css'

export function CityInput() {
  const [locationSearchQuery, setLocationSearchQuery] = useAtom($locationSearchQuery)
  const [citySuggestions] = useAtom($citySuggestions)
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setLocationSearchQuery(e.target.value),
    [setLocationSearchQuery]
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
        value={locationSearchQuery}
        onChange={handleChange}
      />
      <datalist id='cities'>
        {citySuggestions.map(city => (
          <option
            key={city.label}
            value={city.label}
          />
        ))}
      </datalist>
    </div>
  )
}
