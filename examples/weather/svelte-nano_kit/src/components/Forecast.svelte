<script lang="ts">
  import {
    $weatherForecast as weatherForecast
  } from '../stores/weather.js'
  import ForecastWeather from './ForecastWeather.svelte'

  let mode: 'hourly' | 'daily' = $state('hourly')
  let forecastToShow = $derived($weatherForecast.filter(
    (weather, index) => (
      mode === 'hourly' && weather.period === 'hourly' && index < 24
        || mode === 'daily' && weather.period === 'daily'
    )
  ))
</script>

{#if forecastToShow?.length}
  <section>
    <header class="forecast-header">
      <h2 class="forecast-title">Forecast</h2>
      <select
        class="forecast-mode"
        bind:value={mode}
      >
        <option value="hourly">Hourly</option>
        <option value="daily">Daily</option>
      </select>
    </header>
    <ul class="forecast-list">
      {#each forecastToShow as weather}
        <ForecastWeather {weather} {mode} />
      {/each}
    </ul>
  </section>
{/if}
