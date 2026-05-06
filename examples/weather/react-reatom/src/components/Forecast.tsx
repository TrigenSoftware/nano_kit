/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  useState,
  useMemo,
  useCallback
} from 'react'
import { useAtom } from '@reatom/react'
import { $weatherForecast } from '../stores/weather.js'
import { ForecastWeather } from './ForecastWeather.jsx'

export function Forecast() {
  const [weatherForecast] = useAtom($weatherForecast)
  const [mode, setMode] = useState('hourly')
  const forecastToShow = useMemo(
    () => weatherForecast.filter(
      (weather, index) => mode === 'hourly' && weather.period === 'hourly' && index < 24
        || mode === 'daily' && weather.period === 'daily'
    ),
    [weatherForecast, mode]
  )
  const handleModeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setMode(e.target.value),
    []
  )

  if (weatherForecast.length === 0) {
    return null
  }

  return (
    <section>
      <header className='forecast-header'>
        <h2 className='forecast-title'>
          Forecast
        </h2>
        <select
          className='forecast-mode'
          value={mode}
          onChange={handleModeChange}
        >
          <option value='hourly'>
            Hourly
          </option>
          <option value='daily'>
            Daily
          </option>
        </select>
      </header>
      <ul className='forecast-list'>
        {forecastToShow.map(weather => (
          <ForecastWeather
            key={weather.dateText}
            weather={weather}
            mode={mode}
          />
        ))}
      </ul>
    </section>
  )
}
