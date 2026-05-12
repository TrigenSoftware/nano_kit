<script lang="ts">
  import { setHydrationContext } from '@nano_kit/svelte-kit'
  import EpisodesPage from '#src/ui/pages/Episodes.svelte'

  let { data } = $props()

  setHydrationContext({
    dehydrated: () => data.dehydrated
  })
</script>

<svelte:head>
  <title>Episodes | Rick and Morty Wiki</title>
</svelte:head>

<EpisodesPage />
