<script lang="ts">
  import {
    $characters as characters,
    $charactersError as charactersError,
    $charactersLoading as charactersLoading
  } from '../../stores/characters.js'
  import { $charactersPage as charactersPage } from '../../stores/router.js'
  import CharacterGrid from '../components/CharacterGrid.svelte'
  import ErrorState from '../components/ErrorState.svelte'
  import Pagination from '../components/Pagination.svelte'
  import Spinner from '../components/Spinner.svelte'
</script>

<section class="container">
  {#if $charactersError}
    <ErrorState title="Error loading characters" error={$charactersError} />
  {:else if $charactersLoading || !$characters}
    <Spinner>Loading characters...</Spinner>
  {:else}
    <CharacterGrid characters={$characters.items} />
    <Pagination
      current={$charactersPage}
      total={$characters.totalPages}
      label="Character pages navigation"
    />
  {/if}
</section>

<style>
  .container {
    margin: 0 auto;
    padding: 1rem;
  }

  @media (max-width: 768px) {
    .container {
      padding: .75rem;
    }
  }
</style>
