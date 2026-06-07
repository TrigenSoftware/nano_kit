<script lang="ts">
  import { Link } from '@nano_kit/svelte-kit'
  import type { Location } from '#src/services/api'

  interface Props {
    location: Location
  }

  const { location }: Props = $props()
</script>

<article class="location-card-card">
  <Link to="location" params={{ id: location.id }} class="location-card-link">
    <div class="location-card-content">
      <h2 class="location-card-name">{location.name}</h2>
      <dl class="location-card-info">
        <div class="location-card-row">
          <dt class="location-card-label">Type</dt>
          <dd class="location-card-value">{location.type}</dd>
        </div>
        <div class="location-card-row">
          <dt class="location-card-label">Dimension</dt>
          <dd class="location-card-value">{location.dimension}</dd>
        </div>
        <div class="location-card-row">
          <dt class="location-card-label">Residents</dt>
          <dd class="location-card-value">{location.residents.length}</dd>
        </div>
      </dl>
    </div>
  </Link>
</article>

