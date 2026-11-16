import {
  inject,
  signal
} from '@nano_kit/store'

function Soil$() {
  return signal('Soil')
}

export function Stores$() {
  return [inject(Soil$)]
}
