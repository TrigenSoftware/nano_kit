<script lang="ts">
  import { getPage } from './core.js'

  const page = getPage()
  const Page = $page
</script>

{#if Page}
  <Page />
{/if}
