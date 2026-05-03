<script lang="ts">
  import type { Component } from 'svelte'

  interface Props {
    Link: Component<Record<string, unknown>>
    onfocus?(event: FocusEvent): void
    onmouseenter?(event: MouseEvent): void
    preload?: boolean
  }

  const props: Props = $props()
  // svelte-ignore state_referenced_locally
  const Link = props.Link
</script>

<Link
  to="about"
  preload={props.preload}
  onfocus={props.onfocus}
  onmouseenter={props.onmouseenter}
>
  About
</Link>
