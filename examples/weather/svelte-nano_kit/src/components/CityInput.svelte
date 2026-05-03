<script lang="ts">
  import {
    $locationSearchInputValue as locationSearchInputValue,
    $citySuggestions as citySuggestions
  } from '../stores/location.js'
</script>

<div class="root">
  <label for="city">Search for a city:</label>
  <input
    list="cities"
    id="city"
    type="text"
    name="city"
    bind:value={$locationSearchInputValue}
  />

  <datalist id="cities">
    {#each $citySuggestions as city}
      <option value={city.label}></option>
    {/each}
  </datalist>
</div>

<style>
  .root {
    display: flex;
    justify-content: center;
  }

  label {
    margin-right: .3em;
    font-style: italic;
  }

  label, input {
    font-size: 2em;
  }

  @media (max-width: 767px) {
    .root {
      flex-direction: column;
    }

    label {
      margin: 0 0 .3em 0;
    }

    label, input {
      font-size: 1em;
    }
  }
</style>
