<script lang="ts">
  import { getInject } from '@nano_kit/svelte'
  import {
    LocationSearch$,
    CitySuggestions$
  } from '../stores/location.js'
  import Autocomplete from './Autocomplete.svelte'

  const { $searchInputValue: searchInputValue } = getInject(LocationSearch$)
  const { $suggestions: suggestions } = getInject(CitySuggestions$)
</script>

<Autocomplete
  id="city"
  label="Search for a city"
  name="city"
  value={$searchInputValue}
  suggestions={$suggestions}
  onChange={(value) => $searchInputValue = value}
/>
