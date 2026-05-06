import { useSignal } from '@nano_kit/react'
import { $currentWeather } from '../stores/weather.js'
import { $currentLocation } from '../stores/location.js'

export function Weather() {
  const currentWeather = useSignal($currentWeather)
  const city = useSignal($currentLocation)

  if (!currentWeather) {
    return null
  }

  return (
    <div
      className='weather'
      data-city={city?.name}
    >
      <h3 className='weather-temp'>
        {currentWeather.tempText}
      </h3>
      <img
        className='weather-icon'
        src={currentWeather.icon}
        alt={currentWeather.description}
      />
      <p className='weather-feels-like'>
        Feels like
        {' '}
        {currentWeather.feelsLikeText}
      </p>
      <p className='weather-description'>
        {currentWeather.description}
        <br/>
        Humidity:
        {' '}
        {currentWeather.humidity}
        %
      </p>
    </div>
  )
}
