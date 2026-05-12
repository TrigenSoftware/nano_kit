<script lang="ts">
  import { setHydrationContext } from '@nano_kit/svelte-kit'
  import EpisodePage from '#src/ui/pages/Episode.svelte'

  let { data } = $props()

  setHydrationContext({
    dehydrated: () => data.dehydrated
  })
</script>

<EpisodePage />
