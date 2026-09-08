<script lang="ts">
  import { getPage } from './core.js'

  const page = getPage()
  const Page = $derived($page)
</script>

{#if Page}
  <Page />
{/if}
