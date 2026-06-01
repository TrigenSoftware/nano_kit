<script lang="ts">
  import { setHydrationInjector } from '@nano_kit/svelte-kit'
  import LocationsPage from '#src/ui/pages/Locations.svelte'

  let { data } = $props()

  setHydrationInjector({
    dehydrated: () => data.dehydrated
  })
</script>

<svelte:head>
  <title>Locations | Rick and Morty Wiki</title>
</svelte:head>

<LocationsPage />
