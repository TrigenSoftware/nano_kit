<script lang="ts">
  import { setHydrationInjector } from '@nano_kit/svelte-kit'
  import CharacterPage from '#src/ui/pages/Character.svelte'
  import { onMount } from 'svelte';

  let { data } = $props()

  setHydrationInjector({
    dehydrated: () => data.dehydrated
  })
</script>

<CharacterPage />
