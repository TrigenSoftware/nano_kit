<script lang="ts">
  import { getInject } from '@nano_kit/svelte'
  import { CitySuggestions$ } from '../stores/location.js'
  import { CurrentWeather$ } from '../stores/weather.js'

  const { $currentLocation: currentLocation } = getInject(CitySuggestions$)
  const { $weather: weather } = getInject(CurrentWeather$)
</script>

{#if $weather}
  <div
    class="weather"
    data-city={$currentLocation?.name}
  >
    <h3 class="weather-temp">
      {$weather.tempText}
    </h3>
    <img
      class="weather-icon"
      src={$weather.icon}
      alt={$weather.description}
    />
    <p class="weather-feels-like">
      Feels like {$weather.feelsLikeText}
    </p>
    <p class="weather-description">
      {$weather.description}
      <br>
      Humidity: {$weather.humidity}%
    </p>
  </div>
{/if}
