<script lang="ts">
  import type { Component } from 'svelte'

  interface Props {
    Link: Component<Record<string, unknown>>
  }

  const props: Props = $props()
  // svelte-ignore state_referenced_locally
  const Link = props.Link
  let current = $state(1)
</script>

<button type="button" onclick={() => current = 2}>Change page</button>
<Link
  to="character"
  params={{
    id: current
  }}
  class={`page-${current}`}
  aria-current={current === 2 ? 'page' : undefined}
  aria-label={`Go to page ${current}`}
>
  Page {current}
</Link>
