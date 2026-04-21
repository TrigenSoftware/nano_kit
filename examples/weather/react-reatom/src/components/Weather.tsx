import { useAtom } from '@reatom/react'
import { $currentWeather } from '../stores/weather.js'
import styles from './Weather.module.css'

export function Weather() {
  const [currentWeather] = useAtom($currentWeather)

  if (!currentWeather) {
    return null
  }

  return (
    <div className={styles.root}>
      <h3 className={styles.currentTemp}>
        {currentWeather.tempText}
      </h3>
      <img
        className={styles.image}
        src={currentWeather.icon}
        alt={currentWeather.description}
      />
      <p className={styles.feelsLike}>
        Feels like
        {' '}
        {currentWeather.feelsLikeText}
      </p>
      <p className={styles.description}>
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
