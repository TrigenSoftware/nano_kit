<script lang="ts">
  import type { Weather } from '../services/types.js'

  interface Props {
    weather: Readonly<Weather>
    mode: 'hourly' | 'daily'
  }

  let { weather, mode }: Props = $props()
</script>

<div class="forecast-item">
  <time class="forecast-time" datetime={weather.dateText}>
    {#if mode === 'hourly'}
      {weather.date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit'
      })}
    {:else}
      {weather.date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
      })}
    {/if}
  </time>
  <img
    class="forecast-icon"
    src={weather.icon}
    alt={weather.description}
  />
  <h3 class="forecast-temp">
    {weather.tempText}
  </h3>
  <p class="forecast-description">
    {weather.description}
  </p>
</div>
