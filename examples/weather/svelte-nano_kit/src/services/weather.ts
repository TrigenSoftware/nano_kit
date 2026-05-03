import type { City, Weather } from './types'

// Weather code mapping from Open-Meteo
// https://open-meteo.com/en/docs
const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
}

function toTempText(value: number): string {
  return `${value > 0 ? '+' : ''}${value}°`
}

function getWeatherDescription(code: number): string {
  return WEATHER_DESCRIPTIONS[code] || 'Unknown'
}

function getWeatherIcon(code: number): string {
  // Map Open-Meteo weather codes to OpenWeatherMap icon codes
  // https://open-meteo.com/en/docs
  // https://openweathermap.org/weather-conditions
  const CLEAR = 0
  const PARTLY_CLOUDY = 3
  const FOG = 48
  const DRIZZLE = 55
  const RAIN = 65
  const SNOW = 77
  const RAIN_SHOWERS = 82
  const SNOW_SHOWERS = 86

  if (code === CLEAR) {
    return 'https://openweathermap.org/img/wn/01d@2x.png' // clear sky
  }

  if (code === 1) {
    return 'https://openweathermap.org/img/wn/02d@2x.png' // few clouds
  }

  if (code <= PARTLY_CLOUDY) {
    return 'https://openweathermap.org/img/wn/03d@2x.png' // scattered clouds
  }

  if (code <= FOG) {
    return 'https://openweathermap.org/img/wn/50d@2x.png' // mist/fog
  }

  if (code <= DRIZZLE) {
    return 'https://openweathermap.org/img/wn/09d@2x.png' // drizzle
  }

  if (code <= RAIN) {
    return 'https://openweathermap.org/img/wn/10d@2x.png' // rain
  }

  if (code <= SNOW) {
    return 'https://openweathermap.org/img/wn/13d@2x.png' // snow
  }

  if (code <= RAIN_SHOWERS) {
    return 'https://openweathermap.org/img/wn/09d@2x.png' // rain showers
  }

  if (code <= SNOW_SHOWERS) {
    return 'https://openweathermap.org/img/wn/13d@2x.png' // snow showers
  }

  return 'https://openweathermap.org/img/wn/11d@2x.png' // thunderstorm
}

interface RawWeather {
  time: string
  /* eslint-disable @typescript-eslint/naming-convention */
  temperature_2m: number
  apparent_temperature: number
  relative_humidity_2m: number
  weather_code: number
  /* eslint-enable @typescript-eslint/naming-convention */
}

function toWeather(data: RawWeather): Weather {
  const temp = Math.round(data.temperature_2m)
  const feelsLike = Math.round(data.apparent_temperature)

  return {
    date: new Date(data.time),
    dateText: data.time,
    temp,
    tempText: toTempText(temp),
    feelsLike,
    feelsLikeText: toTempText(feelsLike),
    humidity: data.relative_humidity_2m,
    description: getWeatherDescription(data.weather_code),
    icon: getWeatherIcon(data.weather_code)
  }
}

export async function fetchWeather(city: City, signal?: AbortSignal): Promise<Weather> {
  const params = new URLSearchParams({
    latitude: city.lat.toString(),
    longitude: city.lon.toString(),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code',
    timezone: 'auto'
  })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    signal
  })
  const data = await response.json()

  return toWeather(data.current)
}

export async function fetchWeatherForecast(city: City, signal?: AbortSignal): Promise<Weather[]> {
  const params = new URLSearchParams({
    latitude: city.lat.toString(),
    longitude: city.lon.toString(),
    hourly: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code',
    timezone: 'auto',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    forecast_days: '7'
  })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    signal
  })
  const data = await response.json()
  const hourly = data.hourly
  const forecast: Weather[] = []

  for (let i = 0; i < hourly.time.length; i++) {
    forecast.push(
      toWeather({
        time: hourly.time[i],
        /* eslint-disable @typescript-eslint/naming-convention */
        temperature_2m: hourly.temperature_2m[i],
        apparent_temperature: hourly.apparent_temperature[i],
        relative_humidity_2m: hourly.relative_humidity_2m[i],
        weather_code: hourly.weather_code[i]
        /* eslint-enable @typescript-eslint/naming-convention */
      })
    )
  }

  return forecast
}
