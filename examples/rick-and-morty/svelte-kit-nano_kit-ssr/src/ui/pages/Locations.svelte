<script module lang="ts">
  import { inject } from '@nano_kit/store'
  import { Locations$ } from '../../stores/locations.js'

  export function Stores$() {
    const { $locations: locations } = inject(Locations$)

    return [locations]
  }
</script>

<script lang="ts">
  import { getInject } from '@nano_kit/svelte'
  import { Params$ } from '../../stores/router.js'
  import LocationGrid from '../blocks/LocationGrid.svelte'
  import Pagination from '../components/Pagination.svelte'
  import Spinner from '../components/Spinner.svelte'

  const {
    $locations: locations,
    $locationsError: locationsError,
    $locationsLoading: locationsLoading
  } = getInject(Locations$)
  const { $locationsPage: locationsPage } = getInject(Params$)
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
