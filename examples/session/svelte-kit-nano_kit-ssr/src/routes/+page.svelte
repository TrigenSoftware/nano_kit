<script lang="ts">
  import { setHydrationContext } from '@nano_kit/svelte-kit'
  import HomePage from '#src/ui/pages/Home.svelte'

  let { data } = $props()

  setHydrationContext({
    dehydrated: () => data.dehydrated
  })
</script>

<HomePage />
