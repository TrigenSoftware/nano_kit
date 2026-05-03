import { useMemo } from 'react'
import type { Weather } from '../services/types.js'

export interface Props {
  weather: Weather
  mode: string
}

export function ForecastWeather({
  weather,
  mode
}: Props) {
  const weatherTime = useMemo(() => {
    const { date } = weather

    if (!date) {
      return ''
    }

    if (mode === 'hourly') {
      return date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit'
      })
    }

    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short'
    })
  }, [weather, mode])

  return (
    <div className='forecast-item'>
      <time
        className='forecast-time'
        dateTime={weather.dateText}
      >
        {weatherTime}
      </time>
      <img
        className='forecast-icon'
        src={weather.icon}
        alt={weather.description}
      />
      <h3 className='forecast-temp'>
        {weather.tempText}
      </h3>
      <p className='forecast-description'>
        {weather.description}
      </p>
    </div>
  )
}
