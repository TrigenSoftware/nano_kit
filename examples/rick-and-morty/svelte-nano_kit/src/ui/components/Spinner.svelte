<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    children?: Snippet
  }

  const { children }: Props = $props()
</script>

<div class="loading">
  <div class="spinner" aria-hidden="true"></div>
  <p>
    {#if children}
      {@render children()}
    {:else}
      Loading...
    {/if}
  </p>
</div>

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    margin-bottom: 1rem;
    border: 3px solid #e0e0e0;
    border-top: 3px solid #1976d2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    margin: 0;
    font-weight: 700;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
</style>
