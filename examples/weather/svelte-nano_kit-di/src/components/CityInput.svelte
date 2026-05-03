<script lang="ts">
  import { inject } from '@nano_kit/svelte'
  import {
    LocationSearch$,
    CitySuggestions$
  } from '../stores/location.js'

  const { $searchInputValue: searchInputValue } = inject(LocationSearch$)
  const { $suggestions: suggestions } = inject(CitySuggestions$)
</script>

<div class="root">
  <label for="city">Search for a city:</label>
  <input
    list="cities"
    id="city"
    type="text"
    name="city"
    bind:value={$searchInputValue}
  />

  <datalist id="cities">
    {#each $suggestions as city}
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
