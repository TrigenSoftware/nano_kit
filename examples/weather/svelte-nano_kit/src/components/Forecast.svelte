<script lang="ts">
  import {
    $weatherForecast as weatherForecast
  } from '../stores/weather.js'
  import ForecastWeather from './ForecastWeather.svelte'

  let mode: 'hourly' | 'daily' = $state('hourly')
  let forecastToShow = $derived($weatherForecast.filter(
    (_, index) => (mode === 'hourly' && index < 10) || (mode === 'daily' && index % 8 === 0)
  ))
</script>

{#if forecastToShow?.length}
  <section>
    <header class="header">
      <h2 class="title">Forecast</h2>
      <select
        class="mode"
        bind:value={mode}
      >
        <option value="hourly">Hourly</option>
        <option value="daily">Daily</option>
      </select>
    </header>
    <ul class="list">
      {#each forecastToShow as weather}
        <ForecastWeather {weather} {mode} />
      {/each}
    </ul>
  </section>
{/if}

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .mode {
    font-size: 1.2em;
  }

  .list {
    margin: 0;
    display: flex;
    padding: 0;
    list-style: none;
    overflow-y: auto;
    scroll-snap-type: x mandatory;
  }

  @media (max-width: 767px) {
    .title {
      font-size: 1.2em;
    }
  }
</style>
