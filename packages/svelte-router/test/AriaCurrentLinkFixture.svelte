<script lang="ts">
  import type { Component } from 'svelte'

  interface Props {
    Link: Component<Record<string, unknown>>
  }

  const props: Props = $props()
  // svelte-ignore state_referenced_locally
  const Link = props.Link
</script>

<Link href="/">Home</Link>
<Link href="/about">About</Link>
