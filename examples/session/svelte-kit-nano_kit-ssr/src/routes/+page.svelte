<script lang="ts">
  import { setHydrationInjector } from '@nano_kit/svelte-kit'
  import HomePage from '#src/ui/pages/Home.svelte'

  let { data } = $props()

  setHydrationInjector({
    dehydrated: () => data.dehydrated
  })
</script>

<HomePage />
