<script lang="ts">
  import { setHydrationInjector } from '@nano_kit/svelte-kit'
  import LocationPage from '#src/ui/pages/Location.svelte'

  let { data } = $props()

  setHydrationInjector({
    dehydrated: () => data.dehydrated
  })
</script>

<LocationPage />
