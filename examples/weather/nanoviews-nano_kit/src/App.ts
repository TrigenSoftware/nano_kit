import {
  main,
  header,
  h1
} from 'nanoviews'
import { CityInput } from './components/CityInput.js'
import { Weather } from './components/Weather.js'
import { Forecast } from './components/Forecast.js'

export function App() {
  return main({
    class: 'app'
  })(
    header()(
      h1({
        class: 'app-title'
      })(
        'Weather App'
      )
    ),
    CityInput(),
    Weather(),
    Forecast()
  )
}
