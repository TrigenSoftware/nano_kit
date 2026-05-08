<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import { title } from '@nano_kit/svelte-router'
  import { Episodes$ as EpisodesStore$ } from '../../stores/episodes.js'

  export function Head$() {
    return [
      title('Episodes | Rick and Morty Wiki')
    ]
  }

  export function Stores$() {
    const { $episodes: episodes } = inject(EpisodesStore$)

    return [episodes]
  }
</script>

<script lang="ts">
  import { getInject } from '@nano_kit/svelte'
  import { Episodes$ } from '../../stores/episodes.js'
  import { Params$ } from '../../stores/router.js'
  import EpisodeGrid from '../blocks/EpisodeGrid.svelte'
  import Pagination from '../components/Pagination.svelte'
  import Spinner from '../components/Spinner.svelte'

  const {
    $episodes: episodes,
    $episodesError: episodesError,
    $episodesLoading: episodesLoading
  } = getInject(Episodes$)
  const { $episodesPage: episodesPage } = getInject(Params$)
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
