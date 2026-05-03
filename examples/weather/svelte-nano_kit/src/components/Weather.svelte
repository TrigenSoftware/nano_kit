<script lang="ts">
  import {
    $currentWeather as currentWeather
  } from '../stores/weather.js'
</script>

{#if $currentWeather}
  <div class="root">
    <h3 class="currentTemp">
      {$currentWeather.tempText}
    </h3>
    <img
      class="image"
      src={$currentWeather.icon}
      alt={$currentWeather.description}
    />
    <p class="feelsLike">
      Feels like {$currentWeather.feelsLikeText}
    </p>
    <p class="description">
      {$currentWeather.description}
      <br>
      Humidity: {$currentWeather.humidity}%
    </p>
  </div>
{/if}

<style>
  .root {
    display: grid;
    grid-template-columns: max-content max-content;
    column-gap: 0.8rem;
    align-items: baseline;
    justify-content: center;
    padding: 2em 0;
  }

  .root > :nth-child(odd) {
    justify-self: end;
  }

  .root > :nth-child(even) {
    justify-self: start;
  }

  .currentTemp {
    margin: 0;
    font-size: 10em;
    font-weight: normal;
  }

  .feelsLike {
    margin: 0;
    width: 100%;
    text-align: center;
    font-size: 2em;
  }

  .description {
    align-self: start;
    margin: 0;
    font-size: 1.2em;
  }

  .image {
    align-self: center;
  }

  @media (prefers-color-scheme: light) {
    .image {
      border-radius: 100px;
      background-color: oklch(0.26 0 0 / 0.16);
    }
  }

  @media (max-width: 767px) {
    .currentTemp {
      font-size: 5em;
    }

    .feelsLike, .description {
      font-size: 1em;
    }
  }
</style>
