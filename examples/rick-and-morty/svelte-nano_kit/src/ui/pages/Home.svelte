<script lang="ts">
  import { onMount } from 'svelte'
  import { navigation } from '../../stores/router.js'

  onMount(() => {
    navigation.replace('characters')
  })
</script>
