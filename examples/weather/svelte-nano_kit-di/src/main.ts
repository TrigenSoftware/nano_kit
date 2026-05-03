import { mount } from 'svelte'
import '@nano_kit/svelte'
import './app.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!
})

export default app
