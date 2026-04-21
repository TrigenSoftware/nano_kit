import { createRoot } from 'react-dom/client'
import { App } from './App.jsx'
import './app.css'

const root = createRoot(document.getElementById('app')!)

root.render(
  <App/>
)
