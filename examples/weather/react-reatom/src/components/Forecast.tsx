/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  useState,
  useMemo,
  useCallback
} from 'react'
import { useAtom } from '@reatom/react'
import { $weatherForecast } from '../stores/weather.js'
import { ForecastWeather } from './ForecastWeather.jsx'
import styles from './Forecast.module.css'

export function Forecast() {
  const [weatherForecast] = useAtom($weatherForecast)
  const [mode, setMode] = useState('hourly')
  const forecastToShow = useMemo(
    () => weatherForecast.filter(
      (_, index) => (mode === 'hourly' && index < 10) || (mode === 'daily' && index % 8 === 0)
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
      <header className={styles.header}>
        <h2 className={styles.title}>
          Forecast
        </h2>
        <select
          className={styles.mode}
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
      <ul className={styles.list}>
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
