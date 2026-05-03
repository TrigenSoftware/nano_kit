import { useAtom } from '@reatom/react'
import { $currentLocation } from '../stores/location.js'
import { $currentWeather } from '../stores/weather.js'

export function Weather() {
  const [currentWeather] = useAtom($currentWeather)
  const [city] = useAtom($currentLocation)

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
