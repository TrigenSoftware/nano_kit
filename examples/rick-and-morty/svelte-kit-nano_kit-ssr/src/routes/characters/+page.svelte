<script lang="ts">
  import { setHydrationInjector } from '@nano_kit/svelte-kit'
  import CharactersPage from '#src/ui/pages/Characters.svelte'

  let { data } = $props()

  setHydrationInjector({
    dehydrated: () => data.dehydrated
  })
</script>

<svelte:head>
  <title>Characters | Rick and Morty Wiki</title>
</svelte:head>

<CharactersPage />
