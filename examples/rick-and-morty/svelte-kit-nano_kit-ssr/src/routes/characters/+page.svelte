<script lang="ts">
  import { setHydrationContext } from '@nano_kit/svelte-kit'
  import CharactersPage from '#src/ui/pages/Characters.svelte'

  let { data } = $props()

  setHydrationContext({
    dehydrated: () => data.dehydrated
  })
</script>

<svelte:head>
  <title>Characters | Rick and Morty Wiki</title>
</svelte:head>

<CharactersPage />
