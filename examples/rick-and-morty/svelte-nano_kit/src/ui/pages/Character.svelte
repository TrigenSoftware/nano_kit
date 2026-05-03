<script lang="ts">
  import {
    $character as character,
    $characterError as characterError
  } from '../../stores/characters.js'
  import {
    $characterEpisodes as episodes,
    $characterEpisodesError as episodesError,
    $characterEpisodesLoading as episodesLoading
  } from '../../stores/episodes.js'
  import EpisodeGrid from '../components/EpisodeGrid.svelte'
  import ErrorState from '../components/ErrorState.svelte'
  import Spinner from '../components/Spinner.svelte'
</script>

{#if $characterError || $episodesError}
  <ErrorState
    title="Error loading character"
    error={$characterError || $episodesError}
  />
{:else if $episodesLoading || !$character || !$episodes}
  <Spinner>Loading character...</Spinner>
{:else}
  <section class="container">
    <div class="header">
      <img class="image" src={$character.image} alt={$character.name} />
      <div class="info">
        <h1 class="name">{$character.name}</h1>
        <p class="status">
          <span class={`status-indicator ${$character.status.toLowerCase()}`}></span>
          {$character.status} - {$character.species}
        </p>
        {#if $character.type}
          <p class="type">Type: {$character.type}</p>
        {/if}
        <p class="gender">Gender: {$character.gender}</p>
      </div>
    </div>

    <div class="details">
      <article class="section">
        <h2>Origin</h2>
        <p>{$character.origin.name}</p>
      </article>
      <article class="section">
        <h2>Last known location</h2>
        <p>{$character.location.name}</p>
      </article>
      <article class="section">
        <h2>Episodes</h2>
        <p>{$character.episode.length} episodes</p>
      </article>
    </div>

    <section class="episodes-section">
      <h2 id="episodes" class="episodes-title">
        <a href="#episodes">Episodes ({$episodes.length})</a>
      </h2>
      <EpisodeGrid episodes={$episodes} />
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
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .image {
    width: 200px;
    height: 200px;
    border-radius: 12px;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .12);
  }

  .info {
    flex: 1;
  }

  .name {
    margin: 0 0 1rem;
    color: #212121;
    font-size: 2rem;
    font-weight: 500;
  }

  .status {
    display: flex;
    align-items: center;
    gap: .5rem;
    margin: 0 0 .5rem;
    color: #424242;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .alive {
    background-color: #2e7d32;
  }

  .dead {
    background-color: #c62828;
  }

  .unknown {
    background-color: #757575;
  }

  .type,
  .gender {
    margin: .5rem 0;
    color: #757575;
    font-size: 1rem;
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

  .episodes-section {
    margin-top: 2rem;
  }

  .episodes-title {
    margin: 0 0 1.5rem;
    color: #212121;
    font-size: 1.5rem;
    font-weight: 500;
  }

  .episodes-title a {
    color: inherit;
    text-decoration: none;
    transition: color .2s ease;
  }

  .episodes-title a:hover {
    color: #1976d2;
    text-decoration: underline;
  }

  @media (prefers-color-scheme: dark) {
    .name {
      color: #e0e0e0;
    }

    .status {
      color: #bdbdbd;
    }

    .type,
    .gender {
      color: #9e9e9e;
    }

    .section {
      border-color: #616161;
      background: #424242;
    }

    .section h2,
    .episodes-title {
      color: #e0e0e0;
    }

    .section p {
      color: #bdbdbd;
    }

    .episodes-title a:hover {
      color: #42a5f5;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: .75rem;
    }

    .header {
      align-items: center;
      flex-direction: column;
      text-align: center;
    }

    .image {
      width: 150px;
      height: 150px;
    }

    .name {
      font-size: 1.75rem;
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
