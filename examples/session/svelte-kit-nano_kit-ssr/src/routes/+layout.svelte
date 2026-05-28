<script lang="ts">
  import { provide } from '@nano_kit/store'
  import {
    LocationNavigation$,
    getKitNavigation,
    setHydrationContext
  } from '@nano_kit/svelte-kit'
  import { routes } from '#src/stores/router'
  import '../app.css'

  let { data, children } = $props()

  setHydrationContext({
    fromRef: () => data.contextRef,
    context: [
      provide(LocationNavigation$, getKitNavigation(routes))
    ]
  })
</script>

<main class="shell">
  {@render children()}
</main>
