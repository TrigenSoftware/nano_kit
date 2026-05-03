import { useStore } from '@nanostores/solid'
import { Show } from 'solid-js'
import { $currentLocation } from '../stores/location.js'
import { $currentWeather } from '../stores/weather.js'

export function Weather() {
  const currentWeather = useStore($currentWeather)
  const currentLocation = useStore($currentLocation)

  return (
    <Show when={currentWeather()}>
      <div
        class='weather'
        data-city={currentLocation()?.name}
      >
        <h3 class='weather-temp'>
          {currentWeather()!.tempText}
        </h3>
        <img
          class='weather-icon'
          src={currentWeather()!.icon}
          alt={currentWeather()!.description}
        />
        <p
          class='weather-feels-like'
        >
          Feels like {currentWeather()!.feelsLikeText}
        </p>
        <p class='weather-description'>
          {currentWeather()!.description}
          <br />
          Humidity: {currentWeather()!.humidity}%
        </p>
      </div>
    </Show>
  )
}
