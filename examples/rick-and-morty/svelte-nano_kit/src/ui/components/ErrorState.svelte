<script lang="ts">
  interface Props {
    title: string
    error: unknown
  }

  const {
    title,
    error
  }: Props = $props()
</script>

<div class="error">
  <h2>{title}</h2>
  <p>{error instanceof Error ? error.message : error}</p>
</div>

<style>
  .error {
    border: 1px solid #ef5350;
    border-radius: 8px;
    padding: 1rem;
    background: rgba(239, 83, 80, .12);
  }

  h2,
  p {
    margin: 0;
  }

  p {
    margin-top: .5rem;
  }
</style>
