import {
  hydratable,
  inject,
  mountable,
  onMount,
  signal
} from '@nano_kit/store'

function Data$() {
  const $data = hydratable('data', mountable(signal(null)))

  onMount($data, () => {
    $data({
      gone: true
    })

    return () => {
      $data(null)
    }
  })

  return $data
}

export function Stores$() {
  const $data = inject(Data$)

  return [$data]
}

export function Status$() {
  const $data = inject(Data$)

  return $data()?.gone ? 410 : undefined
}

export default function Gone() {
  return 'Gone'
}
