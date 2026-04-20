import { hydratable, inject, mountable, onMount, signal } from '@nano_kit/store'
import { useSignal, useInject } from '@nano_kit/preact'
import { meta, title } from '@nano_kit/router'

function Data$() {
  const $data = hydratable('data', mountable(signal(null)))

  onMount($data, () => {
    $data({
      user: 'John Doe'
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

export function Head$() {
  return [
    meta({
      charSet: 'utf-8'
    }),
    title('Home Page')
  ]
}

export default function Home() {
  const $data = useInject(Data$)
  const data = useSignal($data)

  return <div>Home {data?.user}</div>
}
