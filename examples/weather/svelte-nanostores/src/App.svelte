<script lang="ts">
  import CityInput from './components/CityInput.svelte'
  import Weather from './components/Weather.svelte'
  import Forecast from './components/Forecast.svelte'
</script>

<main class="app">
  <header>
    <h1 class="app-title">Weather App</h1>
  </header>
  <CityInput/>
  <Weather/>
  <Forecast/>
</main>
