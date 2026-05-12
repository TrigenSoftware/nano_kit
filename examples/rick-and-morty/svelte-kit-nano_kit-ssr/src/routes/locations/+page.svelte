<script lang="ts">
  import { setHydrationContext } from '@nano_kit/svelte-kit'
  import LocationsPage from '#src/ui/pages/Locations.svelte'

  let { data } = $props()

  setHydrationContext({
    dehydrated: () => data.dehydrated
  })
</script>

<svelte:head>
  <title>Locations | Rick and Morty Wiki</title>
</svelte:head>

<LocationsPage />
