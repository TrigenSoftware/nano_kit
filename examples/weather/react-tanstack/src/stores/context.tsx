import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect
} from 'react'

interface WeatherContextType {
  locationSearch: string
  setLocationSearch: (value: string) => void
}

const WeatherContext = createContext<WeatherContextType | null>(null)

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [locationSearch, setLocationSearch] = useState('')

  // Load initial city
  useEffect(() => {
    const savedQuery = localStorage.getItem('locationSearch')

    if (savedQuery) {
      setLocationSearch(savedQuery)
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('locationSearch', locationSearch)
  }, [locationSearch])

  return (
    <WeatherContext.Provider
      value={{
        locationSearch,
        setLocationSearch
      }}
    >
      {children}
    </WeatherContext.Provider>
  )
}

export function useWeather() {
  const context = useContext(WeatherContext)

  if (!context) {
    throw new Error('useWeather must be used within WeatherProvider')
  }

  return context
}
