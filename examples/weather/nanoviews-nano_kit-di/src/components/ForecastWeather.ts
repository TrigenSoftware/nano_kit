import {
  type Accessor,
  computed,
  record
} from 'nanoviews/store'
import {
  div,
  time,
  img,
  h3,
  p
} from 'nanoviews'
import type { Weather } from '../services/types.js'

export interface Props {
  weather: Accessor<Weather | undefined>
  mode: Accessor<string>
}

export function ForecastWeather({
  weather,
  mode: $mode
}: Props) {
  const $weather = record(weather)
  const $weatherTime = computed(() => {
    const date = $weather.$date()

    if (!date) {
      return ''
    }

    if ($mode() === 'hourly') {
      return date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit'
      })
    }

    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short'
    })
  })

  return div({
    class: 'forecast-item'
  })(
    time({
      class: 'forecast-time',
      dateTime: $weather.$dateText
    })(
      $weatherTime
    ),
    img({
      class: 'forecast-icon',
      src: $weather.$icon,
      alt: $weather.$description
    }),
    h3({
      class: 'forecast-temp'
    })(
      $weather.$tempText
    ),
    p({
      class: 'forecast-description'
    })(
      $weather.$description
    )
  )
}
