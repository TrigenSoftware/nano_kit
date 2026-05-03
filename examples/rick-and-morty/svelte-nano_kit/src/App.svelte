<script lang="ts">
  import {
    getPageSignal,
    router
  } from '@nano_kit/svelte-router'
  import { $location as location } from './stores/router.js'
  import { pages } from './pages.js'

  const page = router(location, pages)
  const pageComponent = getPageSignal(page)
</script>

{#if $pageComponent}
  {@const Page = $pageComponent}
  <Page />
{/if}
