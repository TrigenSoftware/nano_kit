<script module>
  import {
    hydratable,
    inject,
    mountable,
    onMount,
    signal
  } from '@nano_kit/store'
  import {
    meta,
    title
  } from '@nano_kit/router'

  function Data$() {
    const data = hydratable('data', mountable(signal(null)))

    onMount(data, () => {
      data({
        user: 'John Doe'
      })

      return () => {
        data(null)
      }
    })

    return data
  }

  export function Stores$() {
    const data = inject(Data$)

    return [data]
  }

  export function Head$() {
    return [
      meta({
        charSet: 'utf-8'
      }),
      title('Home Page')
    ]
  }
</script>

<script>
  import { getInject } from '@nano_kit/svelte'

  const data = getInject(Data$)
</script>

<div>Home {$data?.user}</div>
