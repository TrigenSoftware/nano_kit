<script lang="ts">
  import { setHydrationContext } from '@nano_kit/svelte-kit'
  import CharacterPage from '#src/ui/pages/Character.svelte'
  import { onMount } from 'svelte';

  let { data } = $props()

  setHydrationContext({
    dehydrated: () => data.dehydrated
  })
</script>

<CharacterPage />
