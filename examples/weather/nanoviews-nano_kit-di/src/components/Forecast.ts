/* oxlint-disable eslint/no-magic-numbers */
import {
  signal,
  computed,
  length
} from 'nanoviews/store'
import {
  section,
  header,
  h2,
  select,
  option,
  ul,
  $$selected,
  trackBy,
  inject,
  for_,
  if_
} from 'nanoviews'
import { WeatherForecast$ } from '../stores/weather.js'
import { ForecastWeather } from './ForecastWeather.js'

export function Forecast() {
  const { $forecast } = inject(WeatherForecast$)
  const $mode = signal('hourly')
  const $forecastToShow = computed(() => {
    const forecast = $forecast()
    const mode = $mode()

    return forecast.filter(
      (weather, index) => mode === 'hourly' && weather.period === 'hourly' && index < 24
        || mode === 'daily' && weather.period === 'daily'
    )
  })

  return if_(length($forecastToShow))(
    () => section()(
      header({
        class: 'forecast-header'
      })(
        h2({
          class: 'forecast-title'
        })(
          'Forecast'
        ),
        select({
          class: 'forecast-mode',
          [$$selected]: $mode
        })(
          option({
            value: 'hourly'
          })(
            'Hourly'
          ),
          option({
            value: 'daily'
          })(
            'Daily'
          )
        )
      ),
      ul({
        class: 'forecast-list'
      })(
        for_($forecastToShow, trackBy('dateText'))(
          $weather => ForecastWeather({
            weather: $weather,
            mode: $mode
          })
        )
      )
    )
  )
}
