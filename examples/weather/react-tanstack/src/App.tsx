import { WeatherProvider } from './stores/context.jsx'
import { CityInput } from './components/CityInput.jsx'
import { Weather } from './components/Weather.jsx'
import { Forecast } from './components/Forecast.jsx'

export function App() {
  return (
    <WeatherProvider>
      <main className='app'>
        <header>
          <h1 className='app-title'>
            Weather App
          </h1>
        </header>
        <CityInput/>
        <Weather/>
        <Forecast/>
      </main>
    </WeatherProvider>
  )
}
