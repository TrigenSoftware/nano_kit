<script lang="ts">
  import {
    getPageSignal,
    router,
    syncPageHead
  } from '@nano_kit/svelte-router'
  import { $location as location } from './stores/router.js'
  import { pages } from './pages.js'

  const page = router(location, pages)
  const pageComponent = getPageSignal(page)
  const Page = $derived($pageComponent)

  syncPageHead(page)
</script>

{#if Page}
  <Page />
{/if}
