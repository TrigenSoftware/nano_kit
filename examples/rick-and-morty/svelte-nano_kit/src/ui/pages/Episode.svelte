<script lang="ts">
  import {
    $residents as characters,
    $residentsError as charactersError,
    $residentsLoading as charactersLoading
  } from '../../stores/characters.js'
  import {
    $episode as episode,
    $episodeError as episodeError
  } from '../../stores/episodes.js'
  import CharacterGrid from '../components/CharacterGrid.svelte'
  import ErrorState from '../components/ErrorState.svelte'
  import Spinner from '../components/Spinner.svelte'
</script>

{#if $episodeError || $charactersError}
  <ErrorState
    title="Error loading episode"
    error={$episodeError || $charactersError}
  />
{:else if $charactersLoading || !$episode || !$characters}
  <Spinner>Loading episode...</Spinner>
{:else}
  <section class="container">
    <div class="header">
      <div class="info">
        <h1 class="name">{$episode.name}</h1>
        <p class="episode">
          <span class="label">Episode:</span>
          <span class="value">{$episode.episode}</span>
        </p>
        <p class="air-date">
          <span class="label">Air date:</span>
          <span class="value">{$episode.air_date}</span>
        </p>
      </div>
    </div>

    <div class="details">
      <article class="section">
        <h2>Characters</h2>
        <p>{$episode.characters.length} characters</p>
      </article>
    </div>

    <section class="characters-section">
      <h2 id="characters" class="characters-title">
        <a href="#characters">Characters ({$characters.length})</a>
      </h2>
      <CharacterGrid characters={$characters} />
    </section>
  </section>
{/if}

<style>
  .container {
    margin: 0 auto;
    min-height: 60vh;
    padding: 1rem;
  }

  .header {
    margin-bottom: 2rem;
  }

  .info {
    max-width: 600px;
  }

  .name {
    margin: 0 0 1.5rem;
    color: #212121;
    font-size: 2.5rem;
    font-weight: 500;
  }

  .episode,
  .air-date {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 0 0 1rem;
    font-size: 1.125rem;
  }

  .label {
    min-width: 80px;
    color: #757575;
    font-weight: 500;
  }

  .value {
    color: #424242;
    font-weight: 500;
  }

  .details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .section {
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 1.5rem;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .12);
  }

  .section h2 {
    margin: 0 0 1rem;
    color: #212121;
    font-size: 1.25rem;
    font-weight: 500;
  }

  .section p {
    margin: 0;
    color: #424242;
    font-size: 1rem;
  }

  .characters-section {
    margin-top: 3rem;
  }

  .characters-title {
    margin: 0 0 1.5rem;
    color: #212121;
    font-size: 1.5rem;
    font-weight: 500;
  }

  .characters-title a {
    color: inherit;
    text-decoration: none;
    transition: color .2s ease;
  }

  .characters-title a:hover {
    color: #1976d2;
    text-decoration: underline;
  }

  @media (prefers-color-scheme: dark) {
    .name {
      color: #e0e0e0;
    }

    .label {
      color: #9e9e9e;
    }

    .value {
      color: #bdbdbd;
    }

    .section {
      border-color: #616161;
      background: #424242;
    }

    .section h2,
    .characters-title {
      color: #e0e0e0;
    }

    .section p {
      color: #bdbdbd;
    }

    .characters-title a:hover {
      color: #42a5f5;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: .75rem;
    }

    .name {
      font-size: 2rem;
    }

    .episode,
    .air-date {
      align-items: flex-start;
      flex-direction: column;
      gap: .25rem;
    }

    .label {
      min-width: auto;
    }

    .details {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .section {
      padding: 1rem;
    }
  }
</style>
