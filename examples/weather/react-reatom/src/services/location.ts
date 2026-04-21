import { fetchCityByLocation } from './cities.js'

export function getCurrentLocation() {
  return new Promise<GeolocationPosition | null>((resolve, reject) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject)
  })
}

export async function fetchCurrentCity(signal?: AbortSignal) {
  const position = await getCurrentLocation()

  if (!position) {
    return null
  }

  return fetchCityByLocation(position.coords, signal)
}
