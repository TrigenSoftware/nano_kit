import { createRoot } from 'react-dom/client'
import { InjectorProvider } from '@nano_kit/react'
import { App } from './App.jsx'
import './app.css'

const root = createRoot(document.getElementById('app')!)

root.render(
  <InjectorProvider>
    <App/>
  </InjectorProvider>
)
