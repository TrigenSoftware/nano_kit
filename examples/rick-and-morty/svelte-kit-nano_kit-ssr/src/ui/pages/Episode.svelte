<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import { Residents$ } from '../../stores/characters.js'
  import { Episode$ } from '../../stores/episodes.js'

  export function Stores$() {
    const { $episode: episode } = inject(Episode$)
    const { $residents: residents } = inject(Residents$)

    return [episode, residents]
  }
</script>

<script lang="ts">
  import { getInject } from '@nano_kit/svelte'
  import CharacterGrid from '../blocks/CharacterGrid.svelte'
  import Spinner from '../components/Spinner.svelte'

  const {
    $residents: characters,
    $residentsError: charactersError,
    $residentsLoading: charactersLoading
  } = getInject(Residents$)
  const {
    $episode: episode,
    $episodeError: episodeError
  } = getInject(Episode$)
</script>

<svelte:head>
  <title>{$episode?.name || 'Episode'} | Rick and Morty Wiki</title>
</svelte:head>

{#if $episodeError || $charactersError}
  <div class="episode-error">
    <h2>Error loading episode</h2>
    <p>{$episodeError || $charactersError}</p>
  </div>
{:else if $charactersLoading || !$episode || !$characters}
  <Spinner>Loading episode...</Spinner>
{:else}
  <section class="episode-container">
    <div class="episode-detail-header">
      <div class="episode-detail-info">
        <h1 class="episode-detail-name">{$episode.name}</h1>
        <p class="episode-detail-episode">
          <span class="episode-detail-label">Episode:</span>
          <span class="episode-detail-value">{$episode.episode}</span>
        </p>
        <p class="episode-detail-air-date">
          <span class="episode-detail-label">Air date:</span>
          <span class="episode-detail-value">{$episode.air_date}</span>
        </p>
      </div>
    </div>

    <div class="episode-detail-details">
      <article class="episode-detail-section">
        <h2>Characters</h2>
        <p>{$episode.characters.length} characters</p>
      </article>
    </div>

    <section class="episode-characters-section">
      <h2 id="characters" class="episode-characters-title">
        <a href="#characters">Characters ({$characters.length})</a>
      </h2>
      <CharacterGrid characters={$characters} />
    </section>
  </section>
{/if}
