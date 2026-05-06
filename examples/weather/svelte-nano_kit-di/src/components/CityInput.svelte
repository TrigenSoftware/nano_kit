<script lang="ts">
  import { inject } from '@nano_kit/svelte'
  import {
    LocationSearch$,
    CitySuggestions$
  } from '../stores/location.js'
  import Autocomplete from './Autocomplete.svelte'

  const { $searchInputValue: searchInputValue } = inject(LocationSearch$)
  const { $suggestions: suggestions } = inject(CitySuggestions$)
</script>

<Autocomplete
  id="city"
  label="Search for a city"
  name="city"
  value={$searchInputValue}
  suggestions={$suggestions}
  onChange={(value) => $searchInputValue = value}
/>
