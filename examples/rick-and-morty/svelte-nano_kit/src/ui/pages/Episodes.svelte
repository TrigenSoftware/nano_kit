<script module lang="ts">
  import { title } from '@nano_kit/svelte-router'

  export function Head$() {
    return [
      title('Episodes | Rick and Morty Wiki')
    ]
  }
</script>

<script lang="ts">
  import {
    $episodes as episodes,
    $episodesError as episodesError,
    $episodesLoading as episodesLoading
  } from '../../stores/episodes.js'
  import { $episodesPage as episodesPage } from '../../stores/router.js'
  import EpisodeGrid from '../blocks/EpisodeGrid.svelte'
  import Pagination from '../components/Pagination.svelte'
  import Spinner from '../components/Spinner.svelte'
</script>

<section class="episodes-container">
  {#if $episodesError}
    <div class="episodes-error">
      <h2>Error loading episodes</h2>
      <p>{$episodesError}</p>
    </div>
  {:else if $episodesLoading || !$episodes}
    <Spinner>Loading episodes...</Spinner>
  {:else}
    <EpisodeGrid episodes={$episodes.items} />
    <Pagination
      current={$episodesPage}
      total={$episodes.totalPages}
      label="Episode pages navigation"
    />
  {/if}
</section>
