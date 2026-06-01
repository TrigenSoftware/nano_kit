<script lang="ts">
  import { setHydrationInjector } from '@nano_kit/svelte-kit'
  import EpisodePage from '#src/ui/pages/Episode.svelte'

  let { data } = $props()

  setHydrationInjector({
    dehydrated: () => data.dehydrated
  })
</script>

<EpisodePage />
