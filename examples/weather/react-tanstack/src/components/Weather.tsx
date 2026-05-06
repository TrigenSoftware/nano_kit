import { useWeather } from '../stores/context.jsx'
import { useCitySuggestions } from '../stores/cities.js'
import { useCurrentWeather } from '../stores/weather.js'

export function Weather() {
  const { locationSearch } = useWeather()
  const { data: citySuggestions = [] } = useCitySuggestions(locationSearch)
  const currentCity = citySuggestions[0] || null
  const { data: currentWeather } = useCurrentWeather(currentCity)

  if (!currentWeather) {
    return null
  }

  return (
    <div
      className='weather'
      data-city={currentCity?.name}
    >
      <h3 className='weather-temp'>
        {currentWeather.tempText}
      </h3>
      <img
        className='weather-icon'
        src={currentWeather.icon}
        alt={currentWeather.description}
      />
      <p
        className='weather-feels-like'
      >
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
