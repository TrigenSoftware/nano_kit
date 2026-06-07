import { record } from 'nanoviews/store'
import {
  div,
  h3,
  img,
  p,
  br,
  if_
} from 'nanoviews'
import { $currentLocation } from '../stores/location.js'
import { $currentWeather } from '../stores/weather.js'

export function Weather() {
  const $city = record($currentLocation).$name

  return if_($currentWeather)(
    () => div({
      'class': 'weather',
      'data-city': $city
    })(
      h3({
        class: 'weather-temp'
      })(
        $currentWeather.$tempText
      ),
      img({
        class: 'weather-icon',
        src: $currentWeather.$icon,
        alt: $currentWeather.$description
      }),
      p({
        class: 'weather-feels-like'
      })(
        'Feels like ', $currentWeather.$feelsLikeText
      ),
      p({
        class: 'weather-description'
      })(
        $currentWeather.$description,
        br(),
        'Humidity: ',
        $currentWeather.$humidity,
        '%'
      )
    )
  )
}
