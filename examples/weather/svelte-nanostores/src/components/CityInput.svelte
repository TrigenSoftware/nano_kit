<script lang="ts">
  import {
    $locationSearch as locationSearch,
    $citySuggestions as citySuggestions
  } from '../stores/location.js'
  import Autocomplete from './Autocomplete.svelte'
</script>

<Autocomplete
  id="city"
  label="Search for a city"
  name="city"
  value={$locationSearch}
  suggestions={$citySuggestions}
  onChange={(value) => $locationSearch = value}
/>
