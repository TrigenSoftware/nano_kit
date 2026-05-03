<script lang="ts">
  import type { Weather } from '../services/types.js'

  interface Props {
    weather: Readonly<Weather>
    mode: 'hourly' | 'daily'
  }

  let { weather, mode }: Props = $props()
</script>

<div class="root">
  <time class="time" datetime={weather.dateText}>
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
    class="image"
    src={weather.icon}
    alt={weather.description}
  />
  <h3 class="temp">
    {weather.tempText}
  </h3>
  <p class="description">
    {weather.description}
  </p>
</div>

<style>
  .root {
    display: flex;
    flex-direction: column;
    align-items: center;
    scroll-snap-align: start;
  }

  .root:not(:first-child) {
    margin-left: 4em;
  }

  .time {
    font-size: 1.2em;
    font-style: italic;
  }

  .temp {
    margin: 0;
    font-size: 2em;
    font-weight: normal;
  }

  .description {
    text-align: center;
  }

  @media (prefers-color-scheme: light) {
    .image {
      border-radius: 100px;
      background-color: oklch(0.26 0 0 / 0.16);
    }
  }

  @media (max-width: 767px) {
    .root:not(:first-child) {
      margin-left: 1.6em;
    }

    .image {
      width: 80px;
      height: 80px;
    }
  }
</style>
