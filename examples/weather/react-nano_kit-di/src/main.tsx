// First of all, so the stores of the modules below are created in sight of it
import './devtools.js'
import { createRoot } from 'react-dom/client'
import { InjectionContextProvider } from '@nano_kit/react'
import { App } from './App.jsx'
import './app.css'

const root = createRoot(document.getElementById('app')!)

root.render(
  <InjectionContextProvider>
    <App/>
  </InjectionContextProvider>
)
