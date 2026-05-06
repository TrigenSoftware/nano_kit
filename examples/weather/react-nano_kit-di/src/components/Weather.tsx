import {
  useInject,
  useSignal
} from '@nano_kit/react'
import { CitySuggestions$ } from '../stores/location.js'
import { CurrentWeather$ } from '../stores/weather.js'

export function Weather() {
  const { $weather } = useInject(CurrentWeather$)
  const { $currentLocation } = useInject(CitySuggestions$)
  const weather = useSignal($weather)
  const city = useSignal($currentLocation)

  if (!weather) {
    return null
  }

  return (
    <div
      className='weather'
      data-city={city?.name}
    >
      <h3 className='weather-temp'>
        {weather.tempText}
      </h3>
      <img
        className='weather-icon'
        src={weather.icon}
        alt={weather.description}
      />
      <p className='weather-feels-like'>
        Feels like
        {' '}
        {weather.feelsLikeText}
      </p>
      <p className='weather-description'>
        {weather.description}
        <br/>
        Humidity:
        {' '}
        {weather.humidity}
        %
      </p>
    </div>
  )
}
