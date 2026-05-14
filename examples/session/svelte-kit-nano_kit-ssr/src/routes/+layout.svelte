<script lang="ts">
  import { provide } from '@nano_kit/store'
  import {
    Location$,
    Navigation$,
    getKitNavigation,
    setHydrationContext
  } from '@nano_kit/svelte-kit'
  import { routes } from '#src/stores/router'
  import '../app.css'

  let { data, children } = $props()
  const [location, navigation] = getKitNavigation(routes)

  setHydrationContext({
    fromRef: () => data.contextRef,
    context: [
      provide(Location$, location),
      provide(Navigation$, navigation)
    ]
  })
</script>

<main class="shell">
  {@render children()}
</main>
