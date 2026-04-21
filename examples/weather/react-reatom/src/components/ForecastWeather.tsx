import { useMemo } from 'react'
import type { Weather } from '../services/types.js'
import styles from './ForecastWeather.module.css'

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
    <div className={styles.root}>
      <time
        className={styles.time}
        dateTime={weather.dateText}
      >
        {weatherTime}
      </time>
      <img
        className={styles.image}
        src={weather.icon}
        alt={weather.description}
      />
      <h3 className={styles.temp}>
        {weather.tempText}
      </h3>
      <p className={styles.description}>
        {weather.description}
      </p>
    </div>
  )
}
