import { record } from 'nanoviews/store'
import {
  div,
  h3,
  img,
  p,
  br,
  inject,
  if_
} from 'nanoviews'
import { CitySuggestions$ } from '../stores/location.js'
import { CurrentWeather$ } from '../stores/weather.js'

export function Weather() {
  const { $weather } = inject(CurrentWeather$)
  const { $currentLocation } = inject(CitySuggestions$)
  const $city = record($currentLocation).$name

  return if_($weather)(
    () => div({
      'class': 'weather',
      'data-city': $city
    })(
      h3({
        class: 'weather-temp'
      })(
        $weather.$tempText
      ),
      img({
        class: 'weather-icon',
        src: $weather.$icon,
        alt: $weather.$description
      }),
      p({
        class: 'weather-feels-like'
      })(
        'Feels like ', $weather.$feelsLikeText
      ),
      p({
        class: 'weather-description'
      })(
        $weather.$description,
        br(),
        'Humidity: ',
        $weather.$humidity,
        '%'
      )
    )
  )
}
