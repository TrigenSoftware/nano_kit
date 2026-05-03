<script lang="ts">
  import {
    $residents as residents,
    $residentsError as residentsError,
    $residentsLoading as residentsLoading
  } from '../../stores/characters.js'
  import {
    $location as location,
    $locationError as locationError
  } from '../../stores/locations.js'
  import CharacterGrid from '../components/CharacterGrid.svelte'
  import ErrorState from '../components/ErrorState.svelte'
  import Spinner from '../components/Spinner.svelte'
</script>

{#if $locationError || $residentsError}
  <ErrorState
    title="Error loading location"
    error={$locationError || $residentsError}
  />
{:else if $residentsLoading || !$location || !$residents}
  <Spinner>Loading location...</Spinner>
{:else}
  <section class="container">
    <div class="header">
      <div class="info">
        <h1 class="name">{$location.name}</h1>
        <p class="type">
          <span class="label">Type:</span>
          <span class="value">{$location.type}</span>
        </p>
        <p class="dimension">
          <span class="label">Dimension:</span>
          <span class="value">{$location.dimension}</span>
        </p>
      </div>
    </div>

    <div class="details">
      <article class="section">
        <h2>Residents</h2>
        <p>{$location.residents.length} residents</p>
      </article>
    </div>

    <section class="residents-section">
      <h2 id="residents" class="residents-title">
        <a href="#residents">Residents ({$residents.length})</a>
      </h2>
      <CharacterGrid characters={$residents} />
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

  .type,
  .dimension {
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

  .residents-section {
    margin-top: 3rem;
  }

  .residents-title {
    margin: 0 0 1.5rem;
    color: #212121;
    font-size: 1.5rem;
    font-weight: 500;
  }

  .residents-title a {
    color: inherit;
    text-decoration: none;
    transition: color .2s ease;
  }

  .residents-title a:hover {
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
    .residents-title {
      color: #e0e0e0;
    }

    .section p {
      color: #bdbdbd;
    }

    .residents-title a:hover {
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

    .type,
    .dimension {
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
