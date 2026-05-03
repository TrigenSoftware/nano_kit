<script lang="ts">
  import CityInput from './components/CityInput.svelte'
  import Weather from './components/Weather.svelte'
  import Forecast from './components/Forecast.svelte'
</script>

<main class="main">
  <header>
    <h1 class="title">Weather App</h1>
  </header>
  <CityInput/>
  <Weather/>
  <Forecast/>
</main>

<style>
  .main {
    margin-right: 2.5em;
    margin-left: 2.5em;
  }

  .title {
    font-size: 3.2em;
    line-height: 1.1;
  }

  @media (max-width: 767px) {
    .main {
      margin-right: 1em;
      margin-left: 1em;
    }

    .title {
      font-size: 1.6em;
    }
  }
</style>
