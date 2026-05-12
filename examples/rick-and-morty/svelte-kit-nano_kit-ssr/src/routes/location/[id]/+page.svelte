<script lang="ts">
  import { setHydrationContext } from '@nano_kit/svelte-kit'
  import LocationPage from '#src/ui/pages/Location.svelte'

  let { data } = $props()

  setHydrationContext({
    dehydrated: () => data.dehydrated
  })
</script>

<LocationPage />
