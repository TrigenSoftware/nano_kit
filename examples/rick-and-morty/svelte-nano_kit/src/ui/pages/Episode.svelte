<script module lang="ts">
  import { computed } from '@nano_kit/store'
  import { title } from '@nano_kit/svelte-router'
  import { $episode as episode } from '../../stores/episodes.js'

  export function Head$() {
    return [
      title(computed(() => `${episode()?.name || 'Episode'} | Rick and Morty Wiki`))
    ]
  }
</script>

<script lang="ts">
  import {
    $residents as characters,
    $residentsError as charactersError,
    $residentsLoading as charactersLoading
  } from '../../stores/characters.js'
  import { $episodeError as episodeError } from '../../stores/episodes.js'
  import CharacterGrid from '../blocks/CharacterGrid.svelte'
  import Spinner from '../components/Spinner.svelte'
</script>

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
