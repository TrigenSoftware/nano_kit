<script lang="ts">
  import {
    $locations as locations,
    $locationsError as locationsError,
    $locationsLoading as locationsLoading
  } from '../../stores/locations.js'
  import { $locationsPage as locationsPage } from '../../stores/router.js'
  import ErrorState from '../components/ErrorState.svelte'
  import LocationGrid from '../components/LocationGrid.svelte'
  import Pagination from '../components/Pagination.svelte'
  import Spinner from '../components/Spinner.svelte'
</script>

<section class="container">
  {#if $locationsError}
    <ErrorState title="Error loading locations" error={$locationsError} />
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
