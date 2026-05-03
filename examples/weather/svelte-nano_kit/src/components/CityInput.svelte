<script lang="ts">
  import {
    $locationSearchInputValue as locationSearchInputValue,
    $citySuggestions as citySuggestions
  } from '../stores/location.js'
  import Autocomplete from './Autocomplete.svelte'
</script>

<Autocomplete
  id="city"
  label="Search for a city"
  name="city"
  value={$locationSearchInputValue}
  suggestions={$citySuggestions}
  onChange={(value) => $locationSearchInputValue = value}
/>
