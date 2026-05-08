<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    children?: Snippet
  }

  const { children }: Props = $props()
</script>

<div class="spinner-loading">
  <div class="spinner-spinner" aria-hidden="true"></div>
  <p>
    {#if children}
      {@render children()}
    {:else}
      Loading...
    {/if}
  </p>
</div>

