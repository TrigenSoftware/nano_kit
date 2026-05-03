<script lang="ts">
  import type { Accessor } from '@nano_kit/store'
  import type {
    PageRef,
    PageComponent
  } from '../src/index.js'
  import { getPageSignal } from '../src/core.js'

  interface Props {
    page: Accessor<PageRef<PageComponent> | null>
  }

  const props: Props = $props()
  // svelte-ignore state_referenced_locally
  const pageComponent = getPageSignal(props.page)
  const Page = $derived($pageComponent)
</script>

{#if Page}
  <Page />
{:else}
  <div>Not Found</div>
{/if}
