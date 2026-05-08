<script module lang="ts">
  import { title } from '@nano_kit/svelte-router'

  export function Head$() {
    return [
      title('Characters | Rick and Morty Wiki')
    ]
  }
</script>

<script lang="ts">
  import {
    $characters as characters,
    $charactersError as charactersError,
    $charactersLoading as charactersLoading
  } from '../../stores/characters.js'
  import { $charactersPage as charactersPage } from '../../stores/router.js'
  import CharacterGrid from '../blocks/CharacterGrid.svelte'
  import Pagination from '../components/Pagination.svelte'
  import Spinner from '../components/Spinner.svelte'
</script>

<section class="characters-container">
  {#if $charactersError}
    <div class="characters-error">
      <h2>Error loading characters</h2>
      <p>{$charactersError}</p>
    </div>
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
