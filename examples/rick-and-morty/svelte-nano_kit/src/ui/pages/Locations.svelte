<script module lang="ts">
  import { title } from '@nano_kit/svelte-router'

  export function Head$() {
    return [
      title('Locations | Rick and Morty Wiki')
    ]
  }
</script>

<script lang="ts">
  import {
    $locations as locations,
    $locationsError as locationsError,
    $locationsLoading as locationsLoading
  } from '../../stores/locations.js'
  import { $locationsPage as locationsPage } from '../../stores/router.js'
  import LocationGrid from '../blocks/LocationGrid.svelte'
  import Pagination from '../components/Pagination.svelte'
  import Spinner from '../components/Spinner.svelte'
</script>

<section class="locations-container">
  {#if $locationsError}
    <div class="locations-error">
      <h2>Error loading locations</h2>
      <p>{$locationsError}</p>
    </div>
  {:else if $locationsLoading || !$locations}
    <Spinner>Loading locations...</Spinner>
  {:else}
    <LocationGrid locations={$locations.items} />
    <Pagination
      current={$locationsPage}
      total={$locations.totalPages}
      label="Location pages navigation"
    />
  {/if}
</section>
