import type { Weather } from '../services/types.js'

interface Props {
  weather: Weather
  mode: string
}

export function ForecastWeather({ weather, mode }: Props) {
  return (
    <div className='forecast-item'>
      <time
        className='forecast-time'
        dateTime={weather.dateText}
      >
        {mode === 'hourly'
          ? weather.date.toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit'
          })
          : weather.date.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short'
          })}
      </time>
      <img
        className='forecast-icon'
        src={weather.icon}
        alt={weather.description}
      />
      <h3
        className='forecast-temp'
      >
        {weather.tempText}
      </h3>
      <p className='forecast-description'>
        {weather.description}
      </p>
    </div>
  )
}
