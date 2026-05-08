<script lang="ts">
  import type { Location } from '#src/services/api'
  import LocationCard from './LocationCard.svelte'

  interface Props {
    locations: Location[]
  }

  const { locations }: Props = $props()
</script>

<div class="locations-grid-grid">
  {#each locations as location (location.id)}
    <LocationCard {location} />
  {/each}
</div>

