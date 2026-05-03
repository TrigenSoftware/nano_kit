<script lang="ts">
  import {
    $episodes as episodes,
    $episodesError as episodesError,
    $episodesLoading as episodesLoading
  } from '../../stores/episodes.js'
  import { $episodesPage as episodesPage } from '../../stores/router.js'
  import EpisodeGrid from '../components/EpisodeGrid.svelte'
  import ErrorState from '../components/ErrorState.svelte'
  import Pagination from '../components/Pagination.svelte'
  import Spinner from '../components/Spinner.svelte'
</script>

<section class="container">
  {#if $episodesError}
    <ErrorState title="Error loading episodes" error={$episodesError} />
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
