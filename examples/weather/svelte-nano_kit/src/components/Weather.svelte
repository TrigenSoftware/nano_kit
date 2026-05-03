<script lang="ts">
  import {
    $currentLocation as currentLocation
  } from '../stores/location.js'
  import {
    $currentWeather as currentWeather
  } from '../stores/weather.js'
</script>

{#if $currentWeather}
  <div
    class="weather"
    data-city={$currentLocation?.name}
  >
    <h3 class="weather-temp">
      {$currentWeather.tempText}
    </h3>
    <img
      class="weather-icon"
      src={$currentWeather.icon}
      alt={$currentWeather.description}
    />
    <p class="weather-feels-like">
      Feels like {$currentWeather.feelsLikeText}
    </p>
    <p class="weather-description">
      {$currentWeather.description}
      <br>
      Humidity: {$currentWeather.humidity}%
    </p>
  </div>
{/if}
