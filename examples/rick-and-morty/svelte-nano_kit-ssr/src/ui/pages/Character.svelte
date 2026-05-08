<script module lang="ts">
  import {
    computed,
    inject
  } from '@nano_kit/store'
  import { title } from '@nano_kit/svelte-router'
  import { Character$ as CharacterStore$ } from '../../stores/characters.js'
  import { CharacterEpisodes$ as CharacterEpisodesStore$ } from '../../stores/episodes.js'

  export function Head$() {
    const { $character: character } = inject(CharacterStore$)

    return [
      title(computed(() => `${character()?.name || 'Character'} | Rick and Morty Wiki`))
    ]
  }

  export function Stores$() {
    const { $character: character } = inject(CharacterStore$)
    const { $characterEpisodes: characterEpisodes } = inject(CharacterEpisodesStore$)

    return [character, characterEpisodes]
  }
</script>

<script lang="ts">
  import { getInject } from '@nano_kit/svelte'
  import { Character$ } from '../../stores/characters.js'
  import { CharacterEpisodes$ } from '../../stores/episodes.js'
  import EpisodeGrid from '../blocks/EpisodeGrid.svelte'
  import Spinner from '../components/Spinner.svelte'

  const {
    $character: character,
    $characterError: characterError
  } = getInject(Character$)
  const {
    $characterEpisodes: episodes,
    $characterEpisodesError: episodesError,
    $characterEpisodesLoading: episodesLoading
  } = getInject(CharacterEpisodes$)
</script>

{#if $characterError || $episodesError}
  <div class="character-error">
    <h2>Error loading character</h2>
    <p>{$characterError || $episodesError}</p>
  </div>
{:else if $episodesLoading || !$character || !$episodes}
  <Spinner>Loading character...</Spinner>
{:else}
  <section class="character-container">
    <div class="character-detail-header">
      <img class="character-detail-image" src={$character.image} alt={$character.name} />
      <div class="character-detail-info">
        <h1 class="character-detail-name">{$character.name}</h1>
        <p class="character-detail-status">
          <span class={`character-detail-status-indicator character-detail-${$character.status.toLowerCase()}`}></span>
          {$character.status} - {$character.species}
        </p>
        {#if $character.type}
          <p class="character-detail-type">Type: {$character.type}</p>
        {/if}
        <p class="character-detail-gender">Gender: {$character.gender}</p>
      </div>
    </div>

    <div class="character-detail-details">
      <article class="character-detail-section">
        <h2>Origin</h2>
        <p>{$character.origin.name}</p>
      </article>
      <article class="character-detail-section">
        <h2>Last known location</h2>
        <p>{$character.location.name}</p>
      </article>
      <article class="character-detail-section">
        <h2>Episodes</h2>
        <p>{$character.episode.length} episodes</p>
      </article>
    </div>

    <section class="character-episodes-section">
      <h2 id="episodes" class="character-episodes-title">
        <a href="#episodes">Episodes ({$episodes.length})</a>
      </h2>
      <EpisodeGrid episodes={$episodes} />
    </section>
  </section>
{/if}
