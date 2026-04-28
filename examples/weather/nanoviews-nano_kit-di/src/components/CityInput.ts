import { record } from 'nanoviews/store'
import {
  div,
  label,
  input,
  datalist,
  option,
  $$value,
  for_,
  inject
} from 'nanoviews'
import {
  LocationSearch$,
  CitySuggestions$
} from '../stores/location.js'
import styles from './CityInput.module.css'

export function CityInput() {
  const { $searchInputValue } = inject(LocationSearch$)
  const { $suggestions } = inject(CitySuggestions$)

  return div({
    class: styles.root
  })(
    label({
      for: 'city',
      class: styles.label
    })(
      'Search for a city:'
    ),
    input({
      class: styles.input,
      id: 'city',
      type: 'text',
      list: 'cities',
      name: 'city',
      [$$value]: $searchInputValue
    }),
    datalist({
      id: 'cities'
    })(
      for_($suggestions)(
        $city => option({
          value: record($city).$label
        })
      )
    )
  )
}
