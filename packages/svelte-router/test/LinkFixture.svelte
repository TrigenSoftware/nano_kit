<script lang="ts">
  import type { Component } from 'svelte'
  import type { Accessor } from '@nano_kit/store'
  import type {
    PageComponent,
    PageRef
  } from '../src/index.js'
  import { getPageSignal } from '../src/core.js'

  interface Props {
    Link: Component<Record<string, unknown>>
    page: Accessor<PageRef<PageComponent> | null>
  }

  const props: Props = $props()
  // svelte-ignore state_referenced_locally
  const Link = props.Link
  // svelte-ignore state_referenced_locally
  const pageComponent = getPageSignal(props.page)
</script>

<div>
  <nav>
    <Link to="home">Home</Link>
    <Link to="about">About</Link>
  </nav>
  {#if $pageComponent}
    {@const Page = $pageComponent}
    <Page />
  {/if}
</div>
