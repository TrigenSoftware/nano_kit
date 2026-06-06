/* oxlint-disable eslint/no-magic-numbers */
import { useStore } from '@nanostores/solid'
import {
  For,
  Show,
  createSignal,
  createMemo
} from 'solid-js'
import { $weatherForecast } from '../stores/weather.js'
import { ForecastWeather } from './ForecastWeather.jsx'

export function Forecast() {
  const weatherForecast = useStore($weatherForecast)
  const [mode, setMode] = createSignal<'hourly' | 'daily'>('hourly')
  const forecastToShow = createMemo(() => {
    const weatherForecastValue = weatherForecast()
    const modeValue = mode()

    return weatherForecastValue.filter(
      (weather, index) => modeValue === 'hourly' && weather.period === 'hourly' && index < 24
        || modeValue === 'daily' && weather.period === 'daily'
    )
  })

  return (
    <Show when={forecastToShow().length > 0}>
      <section>
        <header class='forecast-header'>
          <h2 class='forecast-title'>Forecast</h2>
          <select
            class='forecast-mode'
            value={mode()}
            onInput={e => setMode(e.currentTarget.value as 'hourly' | 'daily')}
          >
            <option value='hourly'>Hourly</option>
            <option value='daily'>Daily</option>
          </select>
        </header>
        <ul class='forecast-list'>
          <For each={forecastToShow()}>
            {weather => (
              <ForecastWeather
                weather={weather}
                mode={mode()}
              />
            )}
          </For>
        </ul>
      </section>
    </Show>
  )
}
