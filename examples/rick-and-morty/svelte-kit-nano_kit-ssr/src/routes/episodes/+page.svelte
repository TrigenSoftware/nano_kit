<script lang="ts">
  import { setHydrationInjector } from '@nano_kit/svelte-kit'
  import EpisodesPage from '#src/ui/pages/Episodes.svelte'

  let { data } = $props()

  setHydrationInjector({
    dehydrated: () => data.dehydrated
  })
</script>

<svelte:head>
  <title>Episodes | Rick and Morty Wiki</title>
</svelte:head>

<EpisodesPage />
