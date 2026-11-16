import {
  inject,
  signal
} from '@nano_kit/store'
import { Stores$ as SoilStores$ } from './soil.js'

function Garden$() {
  return signal('Garden')
}

export function Stores$() {
  return [inject(Garden$), ...inject(SoilStores$)]
}

export function StatusCode$() {
  return inject(Garden$)() ? undefined : 404
}

export default function Garden() {
  return inject(Garden$)()
}
