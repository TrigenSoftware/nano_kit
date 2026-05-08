<script module lang="ts">
  import { computed } from '@nano_kit/store'
  import { title } from '@nano_kit/svelte-router'
  import { $location as location } from '../../stores/locations.js'

  export function Head$() {
    return [
      title(computed(() => `${location()?.name || 'Location'} | Rick and Morty Wiki`))
    ]
  }
</script>

<script lang="ts">
  import {
    $residents as residents,
    $residentsError as residentsError,
    $residentsLoading as residentsLoading
  } from '../../stores/characters.js'
  import { $locationError as locationError } from '../../stores/locations.js'
  import CharacterGrid from '../blocks/CharacterGrid.svelte'
  import Spinner from '../components/Spinner.svelte'
</script>

{#if $locationError || $residentsError}
  <div class="location-error">
    <h2>Error loading location</h2>
    <p>{$locationError || $residentsError}</p>
  </div>
{:else if $residentsLoading || !$location || !$residents}
  <Spinner>Loading location...</Spinner>
{:else}
  <section class="location-container">
    <div class="location-detail-header">
      <div class="location-detail-info">
        <h1 class="location-detail-name">{$location.name}</h1>
        <p class="location-detail-type">
          <span class="location-detail-label">Type:</span>
          <span class="location-detail-value">{$location.type}</span>
        </p>
        <p class="location-detail-dimension">
          <span class="location-detail-label">Dimension:</span>
          <span class="location-detail-value">{$location.dimension}</span>
        </p>
      </div>
    </div>

    <div class="location-detail-details">
      <article class="location-detail-section">
        <h2>Residents</h2>
        <p>{$location.residents.length} residents</p>
      </article>
    </div>

    <section class="location-residents-section">
      <h2 id="residents" class="location-residents-title">
        <a href="#residents">Residents ({$residents.length})</a>
      </h2>
      <CharacterGrid characters={$residents} />
    </section>
  </section>
{/if}
