<script lang="ts">
  import { onMount } from 'svelte'
  import {
    navigation,
    paths
  } from '../../stores/router.js'

  onMount(() => {
    navigation.replace(paths.characters)
  })
</script>
